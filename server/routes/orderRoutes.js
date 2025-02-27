const express = require("express");
const router = express.Router();
const sentry = require("../sentry");
const orderService = require("../services/orderService");
const paypalService = require("../services/paypalService");
const emailService = require("../services/emailService");
const adminAuth = require("../adminAuth");
const klarnaService = require("../services/klarnaService");

router.post("/createOrder", async (req, res) => {
  const { cartData, shippingInfo } = req.body;

  const payload = {
    purchase_country: "FI",
    purchase_currency: "EUR",
    locale: "fi-FI",
    order_amount: 1000,
    order_tax_amount: 0,
    order_lines: [
      {
        type: "physical",
        reference: "123",
        name: "Arduino Nano",
        quantity: 2,
        quantity_unit: "pcs",
        unit_price: 500,
        tax_rate: 0,
        total_amount: 1000,
        total_tax_amount: 0,
        //product_url: `https://bittiboksi.fi/tuote/123`,
      },
    ],
    merchant_urls: {
      terms: "https://www.example.com/terms.html",
      checkout:
        "https://www.example.com/checkout.html?order_id={checkout.order.id}",
      confirmation:
        "https://www.example.com/confirmation.html?order_id={checkout.order.id}",
      push: "https://www.example.com/api/push?order_id={checkout.order.id}",
    },
  };

  try {
    console.log("Creating order");

    const orderData = await klarnaService.createOrder(payload);

    console.log(orderData);

    // Return paypay order id to client
    return res.status(200).send(orderData);
  } catch (error) {
    console.log(error);

    sentry.captureException(error);
    return res.status(500).json(error);
  }
});

// Create order and send the id back to client
router.post("/createPaypalOrder", async (req, res) => {
  const { cartData, shippingInfo } = req.body;

  sentry.captureMessage("Someone created an order");

  const products = await orderService.getProductsFromDatabase(cartData);

  if (await orderService.isOutOfStock(cartData)) {
    return res.status(400).json({ status: "OUT_OF_STOCK" });
  }

  // Create the "items" array for paypal api request
  const items = cartData.cartItems.map((item) => {
    const product = products.rows.find(
      (row) => row.public_id === item.product.public_id
    );

    return {
      name: product.name,
      quantity: item.quantity.toString(),
      sku: item.public_id,
      url: `https://bittiboksi.fi/tuote/${product.slug}`,
      unit_amount: {
        currency_code: "EUR",
        value: parseFloat(product.price).toFixed(2),
      },
    };
  });

  // Get the shipping cost from database
  const shippingCost = await orderService.getShippingCost(cartData);

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

  // Create the "shipping" object for paypal api request
  const shipping = {
    name: { full_name: shippingInfo.name },
    address: {
      address_line_1: shippingInfo.address_line_1,
      admin_area_2: shippingInfo.admin_area_2,
      postal_code: shippingInfo.postal_code,
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

  const payload = {
    purchase_units: [{ items, amount, shipping }],
    intent: "CAPTURE",
  };

  try {
    const orderData = await paypalService.createOrder(payload);

    const confirmationData = await paypalService.getOrder(orderData.id);
    if (confirmationData.status != "CREATED") {
      throw new Error(
        `Order was not created, status: ${confirmationData.status}`
      );
    }

    // Return paypay order id to client
    return res.status(200).json(orderData.id);
  } catch (error) {
    sentry.captureException(error);
    return res.status(500).json(error);
  }
});

// Capture order
router.post("/captureOrder", async (req, res) => {
  try {
    const { paypalOrderId, cartData, shippingInfo } = req.body;

    const confirmationData = await paypalService.getOrder(paypalOrderId);
    if (confirmationData.status != "APPROVED") {
      throw new Error(
        `Order was not approved, status: ${confirmationData.status}`
      );
    }

    sentry.captureMessage("Someone paid for an order");

    const result = await orderService.addOrderJob({
      paypalOrderId: paypalOrderId,
      cartData: cartData,
    });

    // Save order data to DB if order completed
    if (result.status == "COMPLETED") {
      const orderId = await orderService.addOrderToDatabase(
        paypalOrderId,
        cartData,
        shippingInfo
      );
      return res.status(200).json({ status: result.status, orderId: orderId });
    } else if (result.status == "OUT_OF_STOCK") {
      return res.status(400).json(result);
    } else {
      throw new Error(`Unknown capture response: ${result.status}`);
    }
  } catch (error) {
    sentry.captureException(error);
    return res.status(500).json(error.message);
  }
});

// Get order data for order confirmation page
router.get("/getOrderData/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    // UUIDs are 36 characters
    if (orderId == null || orderId.length != 36) {
      return res.status(400).send({ error: "Invalid order id" });
    }

    const data = await orderService.getOrderData(orderId);
    return res.status(200).json(data);
  } catch (error) {
    sentry.captureException(error);
    throw new Error(`Error getting order data: ${error.message}`);
  }
});

// Get all orders
router.get("/orders", adminAuth, async (req, res) => {
  try {
    const orderData = await orderService.getOrders();
    return res.status(201).json(orderData);
  } catch (error) {
    sentry.captureException(error);
    return res.status(500).json({ error: error.message });
  }
});

// Get all orders
router.post("/sendOrderProcessedEmail", adminAuth, async (req, res) => {
  try {
    const { customerEmail, orderId, shippingName, trackingNumber } = req.body;
    await emailService.sendOrderProcessedEmail(
      customerEmail,
      orderId,
      shippingName,
      trackingNumber
    );

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    sentry.captureException(error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
