const Queue = require("bull");

const orderQueue = new Queue("orderQueue", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

orderQueue.on("ready", () => {
  console.log("Queue connected to Redis successfully");
});

orderQueue.on("error", (error) => {
  console.error("Failed to connect to redis:", error);
});

module.exports = orderQueue;
