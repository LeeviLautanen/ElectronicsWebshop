const pool = require("../db");
const emailService = require("../services/emailService");
const sentry = require("../sentry");
const stripe = require("../stripe");

class OrderService {
  constructor(pool) {
    this.pool = pool; // Database
  }

  // Add and order to queue and return its result
  async addOrderJob(sessionId) {
    try {
      // TODO: Make this function safe to run multiple times,
      // even concurrently, with the same session ID

      console.log("Fulfilling Checkout Session " + sessionId);

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.metadata.fulfilled && session.metadata.fulfilled === "true") {
        console.log("Already fulfilled");
        return;
      }

      if (session.payment_status !== "paid") {
        console.log("Session not paid");
        return;
      }

      const sessionItems = await stripe.checkout.sessions.listLineItems(
        sessionId,
        { limit: 100 }
      );

      const cartItems = await Promise.all(
        sessionItems.data.map(async (item) => {
          const dbProduct = await pool.query(
            "SELECT * FROM products WHERE public_id = $1",
            [item.price.product]
          );

          return {
            product: dbProduct.rows[0],
            quantity: item.quantity,
          };
        })
      );

      const shippingOption = await pool.query(
        "SELECT * FROM shipping_options WHERE public_id = $1",
        [session.metadata.shipping_option_public_id]
      );

      const cartData = {
        cartItems: cartItems,
        shippingOption: shippingOption.rows[0],
      };

      if (await this.isOutOfStock(cartData)) {
        throw new Error(
          `Product was unexpectedly out of stock for order ${sessionId}`
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

      const shippingInfo = {
        name: session.metadata.name,
        phone: session.metadata.phone,
        email: session.metadata.email,
        address_line_1: session.metadata.address_line_1,
        admin_area_2: session.metadata.admin_area_2,
        postal_code: session.metadata.postal_code,
      };

      await this.addOrderToDatabase(sessionId, cartData, shippingInfo);
    } catch (error) {
      sentry.captureException(error);
      throw new Error(`Failed to process order job: ${error.message}`);
    }
  }

  // Add order data to database
  async addOrderToDatabase(stripeSessionId, cartData, shippingInfo) {
    try {
      const { name, email, phone } = shippingInfo;
      const customerId = await this.getCustomerId(name, email, phone);

      const { id, public_id } = await this.createNewOrder(
        stripeSessionId,
        customerId
      );

      await this.createOrderItems(cartData.cartItems, id);

      const shippingPublicId = cartData.shippingOption.public_id;
      await this.createOrderShipping(shippingPublicId, id, shippingInfo);

      // Send order confirmation email
      await emailService.sendOrderConfirmationEmail(email, public_id, cartData);

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
  async createNewOrder(stripeSessionId, customerId) {
    try {
      // Insert row and return its id
      const orderQuery = `
        INSERT INTO orders(customer_id, stripe_session_id) 
        VALUES ($1, $2)
        RETURNING id, public_id
      `;
      const orderResult = await this.pool.query(orderQuery, [
        customerId,
        stripeSessionId,
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

    if (!orderData) {
      throw new Error(`Order not found with id: ${orderId}`);
    }

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

  // Get all orders
  async getOrders() {
    try {
      const orderQuery = `
        SELECT 
          c.name,
          c.email,
          c.phone,
          o.public_id,
          o.status,
          o.created_at,
          json_agg(json_build_object(
            'name', oi.product_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price
          )) AS order_items,
          os.shipping_name,
          os.shipping_cost,
          os.address_line_1,
          os.admin_area_2,
          os.postal_code,
          os.tracking_number
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN order_shipping os ON o.id = os.order_id
        GROUP BY o.id, c.id, os.id;
      `;
      const orderResult = await pool.query(orderQuery);
      return orderResult.rows;
    } catch (error) {
      sentry.captureException(error);
      throw new Error(`orderService getOrders: ${error.message}`);
    }
  }
}

module.exports = new OrderService(pool);
