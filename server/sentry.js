const sentry = require("@sentry/node");

if (process.env.NODE_ENV !== "development") {
  console.log("Sentry initialized");
  sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
}

module.exports = sentry;
