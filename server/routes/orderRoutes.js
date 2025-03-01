const express = require("express");
const router = express.Router();
const sentry = require("../sentry");
const orderService = require("../services/orderService");
const emailService = require("../services/emailService");
const adminAuth = require("../adminAuth");
const stripe = require("../stripe");
const pool = require("../db");
const { validate } = require("uuid");

// Stripe webhook
router.post(
  "/webhook",
  express.json({ type: "application/json" }),
  async (request, response) => {
    try {
      const event = request.body;

      if (
        event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded"
      ) {
        orderService.addOrderJob(event.data.object.id);
      }

      // Return a response to acknowledge receipt of the event
      response.json({ received: true });
    } catch (error) {
      sentry.captureException(error);
    }
  }
);

// Create checkout session when user is ready to pay
router.post("/createCheckoutSession", async (req, res) => {
  try {
    const { cartData, shippingInfo, origin } = req.body;

    const products = await orderService.getProductsFromDatabase(cartData);

    if (await orderService.isOutOfStock(cartData)) {
      return res.status(400).json({ status: "OUT_OF_STOCK" });
    }

    // Create the line_items array for stripe api request
    const items = await Promise.all(
      cartData.cartItems.map(async (item) => {
        const dbProduct = products.rows.find(
          (row) => row.public_id === item.product.public_id
        );

        const stripeProduct = await stripe.products.retrieve(
          dbProduct.public_id
        );

        return {
          price: stripeProduct.default_price,
          quantity: item.quantity,
        };
      })
    );

    const shippingIdResult = await pool.query(
      "SELECT stripe_id FROM shipping_options WHERE public_id = $1",
      [cartData.shippingOption.public_id]
    );
    const shippingId = shippingIdResult.rows[0].stripe_id;

    const session = await stripe.checkout.sessions.create({
      customer_email: shippingInfo.email,
      line_items: items,
      shipping_options: [{ shipping_rate: shippingId }],
      mode: "payment",
      success_url: `${origin}/tilaus/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/kassa`,
      metadata: {
        shipping_option_public_id: cartData.shippingOption.public_id,
        address_line_1: shippingInfo.address_line_1,
        admin_area_2: shippingInfo.admin_area_2,
        postal_code: shippingInfo.postal_code,
        email: shippingInfo.email,
        name: shippingInfo.name,
        phone: shippingInfo.phone,
      },
    });

    res.send({ checkoutUrl: session.url });
  } catch (error) {
    sentry.captureException(error);
    return res.status(500).json({ error: error.message });
  }
});

// Get order data for order confirmation page (can be db id or stripe session id)
router.get("/getOrderData/:orderId", async (req, res) => {
  try {
    let { orderId } = req.params;

    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(orderId);
    } catch (error) {}

    // UUIDs are 36 characters
    if (
      orderId == null ||
      (validate(orderId) == false && session == undefined)
    ) {
      return res.status(400).send("Invalid order id");
    }

    if (session.id) {
      const orderIdResult = await pool.query(
        "SELECT public_id FROM orders WHERE stripe_session_id = $1",
        [session.id]
      );
      orderId = orderIdResult.rows[0].public_id;
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
