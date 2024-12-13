const Queue = require("bull");

const orderQueue = new Queue("orderQueue");

orderQueue.on("ready", () => {
  console.log("Queue connected to Redis successfully");
});

orderQueue.on("error", (error) => {
  console.error("Failed to connect to redis:", error);
});

module.exports = orderQueue;
