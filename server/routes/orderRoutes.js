const express = require("express");
const router = express.Router();
const sentry = require("../sentry");
const orderService = require("../services/orderService");
const emailService = require("../services/emailService");
const adminAuth = require("../adminAuth");
const stripe = require("../stripe");
const pool = require("../db");

async function fulfillCheckout(sessionId) {
  console.log("Fulfilling Checkout Session " + sessionId);

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  console.log(session);

  if (session.metadata.fulfilled && session.metadata.fulfilled === "true") {
    console.log("Already fulfilled");
    return;
  }

  // TODO: Make this function safe to run multiple times,
  // even concurrently, with the same session ID

  // TODO: Make sure fulfillment hasn't already been
  // peformed for this Checkout Session

  // Retrieve the Checkout Session from the API with line_items expanded

  // Check the Checkout Session's payment_status property
  // to determine if fulfillment should be peformed
  if (session.payment_status === "paid") {
    console.log("It went through");
  }
}

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
        console.log(event.data.object);
        fulfillCheckout(event.data.object.id);
      }

      if (false) {
        const checkoutSession = await stripe.checkout.sessions.retrieve(
          sessionId,
          {
            expand: ["line_items"],
          }
        );
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
    const { cartData, shippingInfo } = req.body;

    sentry.captureMessage("Someone created a checkout session");

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

    const shippingIdresult = await pool.query(
      "SELECT stripe_id FROM shipping_options WHERE public_id = $1",
      [cartData.shippingOption.public_id]
    );
    const shippingId = shippingIdresult.rows[0].stripe_id;

    const session = await stripe.checkout.sessions.create({
      customer_email: shippingInfo.email,
      line_items: items,
      shipping_options: [{ shipping_rate: shippingId }],
      mode: "payment",
      success_url: `http://localhost:4200/kauppa`,
      cancel_url: `http://localhost:4200/kassa`,
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
