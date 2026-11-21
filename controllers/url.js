
//to  shorten url if user logged in then only it inserts,then shows generated urls and redirect to home page
const shortid=require("shortid");
const URL=require("../models/url")
const QRCode = require("qrcode");
const bcrypt = require("bcrypt");
const {getEntry}=require("../middleware/redirect");
const redis = require("../redisClient");
async function handleNewShortUrl(req,res){
const body=req.body;

if(!body.query){
    return res.status(400).json("url is required");
}

const x=body.customAlias;
let shortId;
if(x && x.trim()!==""){
    shortId=x.trim();
}
else{
shortId=shortid();
}

const existing=await URL.findOne({
ShortId:shortId
});

if(existing){
return res.render("home",{
     message:"This alias already exists."
});
}
if(x.length>20){
 return res.render("home",{
 message:"Alias should be under 20 characters."
});
}
let hashedPassword = null;
let isProtected = false;

if(body.password){
      hashedPassword = await bcrypt.hash(body.password,10);
      isProtected = true;
}

await URL.create({
ShortId: shortId,
redirectURL: body.query,
visitHistory: [],
createdBy:req.user.tokenid,
password:hashedPassword,
isProtected:isProtected
});

   const shortUrl = `http://localhost:8004/url/${shortId}`;
   const qrCode = await QRCode.toDataURL(shortUrl);
   return res.render("home",{
     id:shortId,
     shortUrl,
     qrCode
    });
}
const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 900; // 15 minutes

async function verifyPassword(req, res) {
  const { shortId } = req.params;
  const attemptKey = `attempts:${shortId}:${req.ip}`;

  try {
    // 1. Already blocked? Stop before doing any work
    const attempts = parseInt(await redis.get(attemptKey), 10) || 0;
    if (attempts >= MAX_ATTEMPTS) {
      return res.status(429).render("verifyPassword", {
        shortId,
        message: "Too many attempts. Try again after 15 minutes.",
      });
    }

    const entry = await getEntry(shortId);
    if (!entry) return res.status(404).send("URL not found");

    const ok = await bcrypt.compare(req.body.password, entry.password);//costly operation therefore rate limiting via redis.

    if (!ok) {
      // 2. Wrong password: count it (key auto-expires after 15 min)
      await redis.set(attemptKey, 0, "EX", WINDOW_SECONDS, "NX");//NX means if not present ,then only set in redis.
      await redis.incr(attemptKey);

      return res.render("verifyPassword", {
        shortId,
        message: "Incorrect password",
      });
    }

    // 3. Correct password: reset the counter
    await redis.del(attemptKey);

    await redis.rpush(`visits:${shortId}`, Date.now());
    return res.redirect(entry.redirectURL);
  } catch (error) {
    console.error("Verify Error:", error);
    return res.status(500).send("Server Error");
  }
}
module.exports={handleNewShortUrl,verifyPassword}
