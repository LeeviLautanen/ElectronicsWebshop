const stripe = require("stripe")(
  process.env.NODE_ENV === "production"
    ? process.env.STRIPE_SECRET
    : process.env.STRIPE_SECRET_DEV
);

module.exports = stripe;
