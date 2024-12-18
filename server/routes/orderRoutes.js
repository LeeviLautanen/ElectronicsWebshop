const express = require("express");
const router = express.Router();
const sentry = require("../sentry");
const orderService = require("../services/orderService");
const paypalService = require("../services/paypalService");

// Create order and send the id back to client
router.post("/createOrder", async (req, res) => {
  const cartData = req.body.cartData;

  const products = await orderService.getProductsFromDatabase(cartData);

  if (await orderService.isOutOfStock(cartData)) {
    return res.status(400).json({ result: "OUT_OF_STOCK" });
  }

  // Create the "items" array for paypal api request
  const items = cartData.cartItems.map((item) => {
    const product = products.rows.find(
      (row) => row.public_id === item.product.public_id
    );

    return {
      name: product.name,
      quantity: item.quantity,
      sku: item.public_id,
      url: `https://bittiboksi.fi/${product.slug}`,
      image_url: `https://bittiboksi.fi/assets/${product.image}`,
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

  const shippingInfo = req.body.shippingInfo;

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
    const data = await paypalService.createOrder(payload);

    // Return orderId to client
    return res.status(200).json(data.id);
  } catch (error) {
    sentry.captureException(error);
    return res.status(500).json({ error: "Error creating paypal order" });
  }
});

// Capture order
router.post("/captureOrder", async (req, res) => {
  try {
    const result = await orderService.addOrderJob({
      orderId: req.body.id,
      cartData: req.body.cartData,
    });

    // Save order data to DB if order completed
    if (result.status == "COMPLETED") {
      orderService.addOrderToDatabase(
        req.body.id,
        req.body.cartData,
        req.body.shippingInfo
      );
      return res.status(200).json(result.status);
    } else if (result.status == "OUT_OF_STOCK") {
      return res.status(400).json(result.status);
    } else {
      throw new Error(`Unknown capture response: ${result.status}`);
    }
  } catch (error) {
    sentry.captureException(error);
    return res.status(500).json(error.message);
  }
});

// Get order data for order confirmation page
router.post("/getOrderData", async (req, res) => {
  try {
    const data = await orderService.getOrderData(req.body.orderId);
    return res.status(200).json(data);
  } catch (error) {
    throw new Error(`Error getting order data: ${error.message}`);
  }
});

module.exports = router;
