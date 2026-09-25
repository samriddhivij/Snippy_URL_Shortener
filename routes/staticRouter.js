const express=require("express");
const router=express.Router();
const {restrictTo}=require("../middleware/auth")
const URL=require("../models/url")
const redis = require("../redisClient");

// -------------------------------------------------------------------
// Helper Function: Calculates Real-Time Clicks (MongoDB + Pending Redis)
// -------------------------------------------------------------------
async function getUrlsWithRealtimeClicks(urls) {
  return await Promise.all(
    urls.map(async (url) => {
      // 1. Get pending clicks sitting in Redis list
      const pendingClicks = await redis.llen(`visits:${url.ShortId}`);

      // 2. Convert Mongoose document to plain JavaScript object
      const plainUrl = url.toObject();

      // 3. Add MongoDB clicks + Redis pending clicks
      plainUrl.TotalClicks =
        (plainUrl.visitHistory ? plainUrl.visitHistory.length : 0) + pendingClicks;

      return plainUrl;
    })
  );
}




router.get("/admin/urls",restrictTo(["ADMIN"]),async (req,res)=>{
 const allurls=await URL.find({});
 const urlsWithClicks = await getUrlsWithRealtimeClicks(allurls);
  return res.render("home",{
      urls:urlsWithClicks,
      role:"admin"
   });
});

router.get("/",restrictTo(["NORMAL","ADMIN"]),async (req,res)=>{
   // if(!req.user){return res.redirect("/login");}  iski jgah inline middleware lga diya uppar vali line main
     const allurls=await URL.find({createdBy:req.user.tokenid});//bas keval khudke apne url dikhenge,isliye
      // checkAuth bnana jaruri thaa jise ki  user ki cookie hi nhi toh fir direct return krdo
   //  const allurls=await URL.find({});


   const urlsWithClicks = await getUrlsWithRealtimeClicks(allurls);
   return res.render("home",{
      urls:urlsWithClicks,
      role: req.user.tokenrole === "ADMIN" ? "admin" : "normal"
   });
});
router.get("/signup",(req,res)=>{
   return res.render("signUp")
});
router.get("/login",(req,res)=>{
   return res.render("login")
});





module.exports=router;