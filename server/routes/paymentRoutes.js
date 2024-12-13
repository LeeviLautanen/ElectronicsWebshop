const express = require("express");
const router = express.Router();
const pool = require("../db");
const axios = require("axios");
const Sentry = require("@sentry/node");
const orderQueue = require("../orderQueue");

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

// Create order queue worker
orderQueue.process(async (job) => {
  const { orderId, cartData } = job.data;

  if (await isOutOfStock(cartData)) {
    return { status: "OUT_OF_STOCK" };
  }

  const token = await getValidToken();

  try {
    // API call for capturing order
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

    if (response.data.status != "COMPLETED") {
      throw new Error("Capturing order failed");
    }

    // Update database stock values
    const updatePromises = cartData.cartItems.map((item) => {
      const updateQuery = `
          UPDATE products
          SET stock = stock - $1
          WHERE public_id = $2
        `;
      return pool.query(updateQuery, [item.quantity, item.product.public_id]);
    });

    await Promise.all(updatePromises);

    return { status: response.data.status };
  } catch (error) {
    Sentry.captureException(error);
    return { status: "FAILED" };
  }
});

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
    Sentry.captureException(error);
  }
};

// Create order and send the id back to client
router.post("/createOrder", async (req, res) => {
  const token = await getValidToken();
  const cartData = req.body.cartData;

  // Get products in cart from database
  const public_ids = cartData.cartItems.map((item) => item.product.public_id);
  const productsQuery = `
    SELECT public_id, slug, name, image, price, stock
    FROM products
    WHERE public_id = ANY($1)`;
  const productsResult = await pool.query(productsQuery, [public_ids]);

  if (await isOutOfStock(req.body.cartData)) {
    return res.status(400).json({ result: "OUT_OF_STOCK" });
  }

  // Create the "items" array for paypal api request
  const items = cartData.cartItems.map((item) => {
    const product = productsResult.rows.find(
      (row) => row.public_id === item.product.public_id
    );

    return {
      name: product.name,
      quantity: item.quantity,
      url: `https://bittiboksi.fi/${product.slug}`,
      image_url: `https://bittiboksi.fi/assets/${product.image}`,
      unit_amount: {
        currency_code: "EUR",
        value: parseFloat(product.price).toFixed(2),
      },
    };
  });

  // Get the shipping cost from database
  const optionsResult = await pool.query(
    "SELECT price FROM shippingOptions WHERE public_id = $1",
    [cartData.shippingOption.public_id]
  );
  const shippingCost = parseFloat(optionsResult.rows[0].price);

  // Calculate the subtotal for order products
  const subTotal = items.reduce((total, item) => {
    return total + item.quantity * parseFloat(item.unit_amount.value);
  }, 0);

  const orderTotal = subTotal + shippingCost;

  // Create the "amount" object for paypal api request
  const amount = {
    currency_code: "EUR",
    value: orderTotal.toFixed(2),
    breakdown: {
      item_total: {
        currency_code: "EUR",
        value: subTotal.toFixed(2),
      },
      shipping: {
        currency_code: "EUR",
        value: shippingCost.toFixed(2),
      },
    },
  };

  const shippingInfo = req.body.shippingInfo;

  // Create the "shipping" object for paypal api request
  const shipping = {
    name: { full_name: shippingInfo.name },
    address: {
      address_line_1: shippingInfo.address,
      admin_area_2: shippingInfo.postalCity,
      postal_code: shippingInfo.postalCode,
      country_code: "FI",
    },
  };

  // Add phone to object if provided
  if (shippingInfo.phone != "") {
    shipping.phone_number = {
      country_code: "358",
      national_number: `358${shippingInfo.phone}`,
    };
  }

  try {
    // API call to create an order
    const response = await axios.post(
      `${base}/v2/checkout/orders`,
      { purchase_units: [{ items, amount, shipping }], intent: "CAPTURE" },
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
    Sentry.captureException(error);
    return res.status(500).json({ error: "Error creating PayPal order" });
  }
});

// Capture order
router.post("/captureOrder", async (req, res) => {
  const job = await orderQueue.add({
    orderId: req.body.id,
    cartData: req.body.cartData,
  });

  try {
    const result = await job.finished();

    if (result.status == "COMPLETED") {
      return res.status(200).json(result.status);
    } else if (result.status == "OUT_OF_STOCK") {
      return res.status(400).json(result.status);
    } else {
      throw new Error("Unknown capture response");
    }
  } catch (error) {
    Sentry.captureException(error);
    return res.status(500).json(error.message);
  }
});

const isOutOfStock = async (cartData) => {
  // Get products in cart from database
  const public_ids = cartData.cartItems.map((item) => item.product.public_id);
  const productsQuery = `
    SELECT public_id, slug, name, image, price, stock
    FROM products
    WHERE public_id = ANY($1)`;
  const productsResult = await pool.query(productsQuery, [public_ids]);

  for (const cartItem of cartData.cartItems) {
    const dbProduct = productsResult.rows.find(
      (p) => p.public_id == cartItem.product.public_id
    );

    if (dbProduct.stock < cartItem.quantity) {
      return true;
    }
  }
  return false;
};

module.exports = router;
