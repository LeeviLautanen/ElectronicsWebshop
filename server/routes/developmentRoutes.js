const express = require("express");
const router = express.Router();
const pool = require("../db");
const Sentry = require("../sentry");

// Sentry test route
router.get("/sentry-test", async (req, res) => {
  try {
    throw new Error("Sentry works");
  } catch (error) {
    Sentry.captureException(error);
    res.status(400).json({ result: "Sentry test" });
  }
});

module.exports = router;
