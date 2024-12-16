const pool = require("../db");
const paypalService = require("../services/paypalService");
const orderQueue = require("../orderQueue");

class OrderService {
  constructor(pool, paypalService, orderQueue) {
    this.pool = pool; // Database
    this.paypalService = paypalService; // Paypal API calls
    this.orderQueue = orderQueue; // Bull queue
    this.orderQueue.process(this.queueJob.bind(this));
  }

  async queueJob(job) {
    const { orderId, cartData } = job.data;

    if (await this.isOutOfStock(cartData)) {
      console.log("no stock");
      return { status: "OUT_OF_STOCK" };
    }

    try {
      const data = await this.paypalService.captureOrder(orderId);

      if (data.status != "COMPLETED") {
        console.log("not completed");

        throw new Error(
          `Capturing order failed for orderId ${orderId} with status: ${data.status}`
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
        `Queue job failed for orderId ${orderId}: ${error.message}`
      );
    }
  }

  // Add and order to queue and return its result
  async addOrderJob(data) {
    try {
      const job = await this.orderQueue.add(data);
      return await job.finished();
    } catch (error) {
      throw new Error(`Failed to add/process order job: ${error.message}`);
    }
  }

  // Add order data to database
  async addOrderToDatabase(paypalOrderId, cartData, shippingInfo) {
    try {
      const { name, email, phone } = shippingInfo;
      const customerId = await this.getCustomerId(name, email, phone);

      const orderId = await this.createNewOrder(paypalOrderId, customerId);

      await this.createOrderItems(cartData.cartItems, orderId);

      const shippingPublicId = cartData.shippingOption.public_id;
      await this.createOrderShipping(shippingPublicId, orderId, shippingInfo);
    } catch (error) {
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
        RETURNING id
      `;
      const orderResult = await this.pool.query(orderQuery, [
        customerId,
        paypalOrderId,
      ]);
      return orderResult.rows[0].id;
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
      const shippingQuery = `SELECT id, price FROM shipping_options WHERE public_id = $1`;
      const shippingResult = await this.pool.query(shippingQuery, [public_id]);
      const { id, price } = shippingResult.rows[0];

      // Insert new row
      const orderShippingQuery = `
        INSERT INTO order_shipping(order_id, shipping_option_id, shipping_cost, address_line_1, admin_area_2, postal_code) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      const { address_line_1, admin_area_2, postal_code } = shippingInfo;
      await this.pool.query(orderShippingQuery, [
        orderId,
        id,
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
