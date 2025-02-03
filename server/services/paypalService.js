const axios = require("axios");

class PaypalService {
  constructor(axios) {
    this.axios = axios;
    this.isDev = process.env.NODE_ENV !== "production";
    this.base = this.isDev
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";
    this.clientId = this.isDev
      ? process.env.PAYPAL_CLIENT_ID_DEV
      : process.env.PAYPAL_CLIENT_ID;
    this.secret = this.isDev
      ? process.env.PAYPAL_SECRET_DEV
      : process.env.PAYPAL_SECRET;
    this.authToken = {
      token: null,
      expiresAt: new Date(),
    };
  }

  // Create an order with paypal API
  async createOrder(payload) {
    try {
      const token = await this.getToken();
      const response = await this.axios.post(
        `${this.base}/v2/checkout/orders`,
        payload,
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
        `PaypalService createOrder: ${error.response.data.details.description}`
      );
    }
  }

  // Capture order payment with paypal API
  async captureOrder(orderId) {
    try {
      const token = await this.getToken();
      const response = await this.axios.post(
        `${this.base}/v2/checkout/orders/${orderId}/capture`,
        {},
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
        `PaypalService captureOrder: ${error.response.data.name}, Base: ${this.base}, Env: ${process.env.NODE_ENV}`
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
      throw new Error(`PaypalService getOrder: ${error.response.data.name}`);
    }
  }

  // Get a token and refresh it if needed
  async getToken() {
    const now = new Date();
    if (this.authToken.expiresAt <= now) {
      try {
        const res = await this.axios.post(
          `${this.base}/v1/oauth2/token`,
          "grant_type=client_credentials",
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(
                `${this.clientId}:${this.secret}`
              ).toString("base64")}`,
            },
          }
        );

        // Update token and its expiry date
        this.authToken.token = res.data.access_token;
        this.authToken.expiresAt = new Date(
          Date.now() + res.data.expires_in * 1000
        );
      } catch (error) {
        throw new Error(`Error getting paypal token: ${error.message}`);
      }
    }
    return this.authToken.token;
  }
}

module.exports = new PaypalService(axios);
