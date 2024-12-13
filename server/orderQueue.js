const Queue = require("bull");

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

console.log(redisConfig);

const orderQueue = new Queue("orderQueue", { redis: redisConfig });

orderQueue.on("ready", () => {
  console.log("Queue connected to Redis successfully");
});

orderQueue.on("error", (error) => {
  console.error("Failed to connect to redis:", error);
});

module.exports = orderQueue;
