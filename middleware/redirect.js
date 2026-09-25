const URL = require("../models/url");
const redis = require("../redisClient");

async function handleRedirectUsers(req, res) {
  const { shortId } = req.params;

  try {
    let entry;

    // 1. Check Redis cache
    const cachedEntry = await redis.get(`url:${shortId}`);

    if (cachedEntry) {
      // CACHE HIT: Read from RAM (<1ms)
      entry = JSON.parse(cachedEntry);
    } else {
      // CACHE MISS: Query MongoDB & save to Redis for 24 hours
      entry = await URL.findOne({ ShortId: shortId });

      if (!entry) {
        return res.status(404).send("URL not found");
      }

      await redis.set(`url:${shortId}`, JSON.stringify(entry), "EX", 86400);//24 hrs=86400 sec
    }

    // 2. Password Check
    if (entry.isProtected) {
      return res.render("verifyPassword", {
        shortId: entry.ShortId,
      });
    }

    // 3. Fast Click Count: Push timestamp to Redis list instead of heavy DB update
    await redis.rpush(`visits:${shortId}`, Date.now());

    // 4. Redirect immediately
    // console.log(" it got redirected from redis");
    return res.redirect(entry.redirectURL);

  } catch (error) {
    console.error("Redirect Error:", error);
    return res.status(500).send("Server Error");
  }
}

//it is running after every 3 minutes
async function syncVisitsToMongoDB() {
  try {
    const keys = await redis.keys("visits:*");//inserting time,we inserted liked visits123 so it is finding all keys starting with visits

    for (const key of keys) {
      const shortId = key.replace("visits:", "");//just keeping shortId means visits123 to 123


      const timestamps = await redis.lpop(key, 500);//means removing 500 items from left in this interval 

      if (timestamps && timestamps.length > 0) {
        const visitObjects = timestamps.map((ts) => ({
          timestamp: Number(ts),
        }));//making defined insertion in mongo db

        // Batch insert into MongoDB in a single query
        await URL.updateOne(
          { ShortId: shortId },
          { $push: { visitHistory: { $each: visitObjects } } }//each used to unpack visitObjects array 
        );
      }
    }
  } catch (error) {
    console.error("Error syncing visit history to MongoDB:", error);
  }
}

module.exports = { handleRedirectUsers,syncVisitsToMongoDB };