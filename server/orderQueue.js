const Queue = require("bull");

const orderQueue = new Queue("orderQueue", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
});

orderQueue.on("error", (error) => {
  console.error("Failed to connect to redis:", error);
});

module.exports = orderQueue;
