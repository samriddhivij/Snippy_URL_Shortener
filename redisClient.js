const Redis = require("ioredis");
require("dotenv").config();
const redis = new Redis(
process.env.Redis_api,
  {
    keepAlive: 10000, // Send a heartbeat every 10 seconds to prevent drops
    tls: {
      rejectUnauthorized: false,
    },
    maxRetriesPerRequest: null, // Let ioredis retry smoothly without throwing max retry errors
  }
);

// .once ensures this log only prints ONCE when your app starts
redis.once("ready", () => {
  console.log("⚡ Connected to Upstash Redis successfully!");
});

// Clean up error logging so idle resets don't flood your console
redis.on("error", (err) => {
  if (err.code === "ECONNRESET") return; // Ignore harmless idle drops
  console.error("❌ Redis error:", err.message);
});

module.exports = redis;