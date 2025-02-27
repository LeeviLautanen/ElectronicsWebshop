const axios = require("axios");

class KlarnaService {
  constructor(axios) {
    this.axios = axios;
    this.isDev = process.env.NODE_ENV !== "production";
    this.base = this.isDev
      ? "https://api.playground.klarna.com"
      : "https://api.klarna.com";
    this.username = this.isDev
      ? process.env.KLARNA_USERNAME_DEV
      : process.env.KLARNA_USERNAME;
    this.password = this.isDev
      ? process.env.KLARNA_PASSWORD_DEV
      : process.env.KLARNA_PASSWORD;
  }

  // Create an order with klarna API
  async createOrder(payload) {
    try {
      console.log(`Basic ${this.username}:${this.password}`);
      const response = await this.axios.post(
        `${this.base}/checkout/v3/orders`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${this.username}:${this.password}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.log(error.response.data);

      throw new Error(
        `KlarnaService createOrder: ${error.response.data.error_code}`
      );
    }
  }

  // Get order data that paypal has
  async getOrder(orderId) {
    try {
      const token = await this.getToken();
      const response = await this.axios.get(
        `${this.base}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `KlarnaService getOrder: ${error.response.data.error_code}`
      );
    }
  }
}

module.exports = new KlarnaService(axios);
