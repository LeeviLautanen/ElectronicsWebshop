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
    this.authToken = {
      token: null,
      expiresAt: new Date(),
    };
  }

  // Create an order with klarna API
  async createOrder(payload) {
    try {
      const response = await this.axios.post(
        `${this.base}/checkout/v3/orders`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${process.env.KLARNA_USERNAME}:${process.env.KLARNA_PASSWORD}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `KlarnaService createOrder: ${error.response.data.details.description}`
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
      throw new Error(`KlarnaService getOrder: ${error.response.data.name}`);
    }
  }
}

module.exports = new KlarnaService(axios);
