const sentry = require("@sentry/node");

if (process.env.NODE_ENV !== "development") {
  sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
}

module.exports = sentry;
