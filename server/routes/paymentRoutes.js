const express = require("express");
const router = express.Router();
const pool = require("../db");
const axios = require("axios");

const isDev = process.env.NODE_ENV === "development";

// Paypal api base url
const base = isDev
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

// Paypal client id
const paypalClientId = isDev
  ? process.env.PAYPAL_CLIENT_ID_DEV
  : process.env.PAYPAL_CLIENT_ID;

// Paypal client secret
const paypalSecret = isDev
  ? process.env.PAYPAL_SECRET_DEV
  : process.env.PAYPAL_SECRET;

// Paypal auth token
let authToken = {
  token: null,
  expiresAt: new Date(),
};

// Get a token and refresh it if needed
const getValidToken = async () => {
  const now = new Date();
  if (authToken.expiresAt <= now) {
    return await getAccessToken();
  }
  return authToken.token;
};

// Get a fresh auth token
const getAccessToken = async () => {
  try {
    // API call to get the new token
    const res = await axios.post(
      `${base}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${paypalClientId}:${paypalSecret}`
          ).toString("base64")}`,
        },
      }
    );

    // Update token and its expiry date
    authToken.token = res.data.access_token;
    authToken.expiresAt = new Date(Date.now() + res.data.expires_in * 1000);
    return authToken.token;
  } catch (error) {
    console.error("Error refreshing token: " + error);
  }
};

// Create order and send the id back to client
router.post("/createOrder", async (req, res) => {
  const token = await getValidToken();

  try {
    // API call to create an order
    const response = await axios.post(
      `${base}/v2/checkout/orders`,
      {
        purchase_units: [
          {
            amount: {
              currency_code: "EUR",
              value: "12.34",
            },
          },
        ],
        intent: "CAPTURE",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Return orderId to client
    return res.status(200).json(response.data.id);
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Error creating PayPal order" });
  }
});

// Capture order
router.post("/captureOrder", async (req, res) => {
  const orderId = req.body.id;
  const token = await getValidToken();

  try {
    // API call to
    const response = await axios.post(
      `${base}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data);
    // Send PayPal order response to the client
    return res.status(200).json(response.data.status);
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Error creating PayPal order" });
  }
});

module.exports = router;
