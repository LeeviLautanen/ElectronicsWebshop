const { Pool } = require("pg");

const isDev = process.env.NODE_ENV === "development";

// Postgres connection
const pool = new Pool({
  host: isDev ? process.env.DB_HOST_DEV : process.env.DB_HOST,
  database: isDev ? process.env.DB_NAME_DEV : process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection
pool
  .connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Error connecting to the database", err));

module.exports = pool;
