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
      return { status: "OUT_OF_STOCK" };
    }

    try {
      const data = await this.paypalService.captureOrder(orderId);

      if (data.status != "COMPLETED") {
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
      "SELECT price FROM shippingOptions WHERE public_id = $1",
      [cartData.shippingOption.public_id]
    );
    return parseFloat(optionsResult.rows[0].price);
  }
}

module.exports = new OrderService(pool, paypalService, orderQueue);
