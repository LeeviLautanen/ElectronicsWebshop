const pool = require("../db");
const paypalService = require("../services/paypalService");
const emailService = require("../services/emailService");
const orderQueue = require("../orderQueue");
const sentry = require("../sentry");

class OrderService {
  constructor(pool, paypalService, orderQueue) {
    this.pool = pool; // Database
    this.paypalService = paypalService; // Paypal API calls
    this.orderQueue = orderQueue; // Bull queue
    this.orderQueue.process(this.queueJob.bind(this));
  }

  async queueJob(job) {
    const { paypalOrderId, cartData } = job.data;

    if (await this.isOutOfStock(cartData)) {
      return { status: "OUT_OF_STOCK" };
    }

    try {
      console.log(`Queue paypal order id: ${paypalOrderId}`);

      const data = await this.paypalService.captureOrder(paypalOrderId);

      if (data.status != "COMPLETED") {
        throw new Error(
          `Capturing order failed for order id ${paypalOrderId} with status: ${data.status}`
        );
      }

      // Update database stock values
      const updatePromises = cartData.cartItems.map((item) => {
        const updateQuery = `
            UPDATE products
            SET stock = stock - $1
            WHERE public_id = $2
          `;
        return this.pool.query(updateQuery, [
          item.quantity,
          item.product.public_id,
        ]);
      });

      await Promise.all(updatePromises);

      return { status: data.status };
    } catch (error) {
      throw new Error(
        `Queue job failed for orderId ${paypalOrderId}: ${error.message}`
      );
    }
  }

  // Add and order to queue and return its result
  async addOrderJob(data) {
    try {
      const job = await this.orderQueue.add(data);
      return await job.finished();
    } catch (error) {
      sentry.captureException(error);
      throw new Error(`Failed to add/process order job: ${error.message}`);
    }
  }

  // Add order data to database
  async addOrderToDatabase(paypalOrderId, cartData, shippingInfo) {
    try {
      const { name, email, phone } = shippingInfo;
      const customerId = await this.getCustomerId(name, email, phone);

      const { id, public_id } = await this.createNewOrder(
        paypalOrderId,
        customerId
      );

      await this.createOrderItems(cartData.cartItems, id);

      const shippingPublicId = cartData.shippingOption.public_id;
      await this.createOrderShipping(shippingPublicId, id, shippingInfo);

      // Send order confirmation email
      emailService.sendOrderConfirmationEmail(email, public_id, cartData);

      return public_id;
    } catch (error) {
      sentry.captureException(error);
      throw new Error(
        `Error adding order information to database: ${error.message}`
      );
    }
  }

  // Get customer row id or create new row
  async getCustomerId(name, email, phone) {
    try {
      // Try to find existing customer with matching name and email
      const existingCustomerQuery = `
        SELECT id
        FROM customers
        WHERE name = $1 AND email = $2 
      `;
      const existingCustomerResult = await this.pool.query(
        existingCustomerQuery,
        [name, email]
      );

      if (existingCustomerResult.rows.length > 0) {
        return existingCustomerResult.rows[0].id;
      }

      // If no customer found, create a new one
      const addCustomerQuery = `
        INSERT INTO customers(name, email, phone) 
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const addCustomerResult = await this.pool.query(addCustomerQuery, [
        name,
        email,
        phone,
      ]);
      return addCustomerResult.rows[0].id;
    } catch (error) {
      throw new Error(
        `Error getting/creating customer in database: ${error.msg}`
      );
    }
  }

  // Create a row in orders
  async createNewOrder(paypalOrderId, customerId) {
    try {
      // Insert row and return its id
      const orderQuery = `
        INSERT INTO orders(customer_id, paypal_order_id) 
        VALUES ($1, $2)
        RETURNING id, public_id
      `;
      const orderResult = await this.pool.query(orderQuery, [
        customerId,
        paypalOrderId,
      ]);
      return orderResult.rows[0];
    } catch (error) {
      throw new Error(
        `Error inserting a new order to database: ${error.message}`
      );
    }
  }

  // Create the order_items row
  async createOrderItems(cartItems, orderId) {
    try {
      for (const item of cartItems) {
        // Get product id
        const productQuery = `SELECT id FROM products WHERE public_id = $1`;
        const productResult = await this.pool.query(productQuery, [
          item.product.public_id,
        ]);

        // Insert row to order_items
        const orderItemsQuery = `
          INSERT INTO order_items(order_id, product_id, quantity, product_name, unit_price) 
          VALUES ($1, $2, $3, $4, $5)
        `;
        await this.pool.query(orderItemsQuery, [
          orderId,
          productResult.rows[0].id,
          item.quantity,
          item.product.name,
          item.product.price,
        ]);
      }
    } catch (error) {
      throw new Error(`Error adding order_items to database: ${error.message}`);
    }
  }

  // Create the order_shipping row
  async createOrderShipping(public_id, orderId, shippingInfo) {
    try {
      // Get the shipping option id
      const shippingQuery = `SELECT id, name, price FROM shipping_options WHERE public_id = $1`;
      const shippingResult = await this.pool.query(shippingQuery, [public_id]);
      const { id, name, price } = shippingResult.rows[0];

      // Insert new row
      const orderShippingQuery = `
        INSERT INTO order_shipping(order_id, shipping_option_id, shipping_name, shipping_cost, address_line_1, admin_area_2, postal_code) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      const { address_line_1, admin_area_2, postal_code } = shippingInfo;
      await this.pool.query(orderShippingQuery, [
        orderId,
        id,
        name,
        price,
        address_line_1,
        admin_area_2,
        postal_code,
      ]);
    } catch (error) {
      throw new Error(
        `Error adding order_shipping to database: ${error.message}`
      );
    }
  }

  // Check if any item is out of stock in cart
  async isOutOfStock(cartData) {
    // Get products in cart from database
    const products = await this.getProductsFromDatabase(cartData);
    const productMap = new Map(
      products.rows.map((p) => [p.public_id, p.stock])
    );

    return cartData.cartItems.some(
      (item) => productMap.get(item.product.public_id) < item.quantity
    );
  }

  // Get products in cart data from database
  async getProductsFromDatabase(cartData) {
    const public_ids = cartData.cartItems.map((item) => item.product.public_id);
    const productsQuery = `
      SELECT public_id, slug, name, image, price, stock
      FROM products
      WHERE public_id = ANY($1)`;
    const productsResult = await this.pool.query(productsQuery, [public_ids]);
    return productsResult;
  }

  // Get order data from database
  async getOrderData(orderId) {
    // Get order creation date, shipping name and cost
    const orderQuery = `
        SELECT 
          o.created_at,
          os.shipping_name,
          os.shipping_cost
        FROM 
          orders o
          LEFT JOIN order_shipping os ON o.id = os.order_id
        WHERE 
          o.public_id = $1;
      `;
    const orderResult = await this.pool.query(orderQuery, [orderId]);
    const orderData = orderResult.rows[0];

    // Get name, quantity and price for order items
    const orderItemQuery = `
      SELECT 
        oi.product_name,
        oi.quantity,
        oi.unit_price
      FROM 
        order_items oi
        INNER JOIN orders o ON oi.order_id = o.id
      WHERE 
        o.public_id = $1;
    `;
    const orderItemResult = await this.pool.query(orderItemQuery, [orderId]);
    const orderItems = orderItemResult.rows.map((row) => ({
      name: row.product_name,
      quantity: row.quantity,
      price: parseFloat(row.unit_price),
    }));

    const payload = {
      orderId: orderId,
      createdAt: orderData.created_at,
      shippingName: orderData.shipping_name,
      shippingCost: parseFloat(orderData.shipping_cost),
      orderItems: orderItems,
    };

    return payload;
  }

  // Get shipping cost from cart data
  async getShippingCost(cartData) {
    const optionsResult = await this.pool.query(
      "SELECT price FROM shipping_options WHERE public_id = $1",
      [cartData.shippingOption.public_id]
    );
    return parseFloat(optionsResult.rows[0].price);
  }
}

module.exports = new OrderService(pool, paypalService, orderQueue);
