const express=require("express");
const router=express.Router();
const urlGenerationLimiter = require("../middleware/rateLimiter");
const{handleNewShortUrl,verifyPassword}=require("../controllers/url");

router.post("/",urlGenerationLimiter,handleNewShortUrl)
// router.get("/analytics/:x",handleGetAnalytics);
// router.get("/:shortId",handleRedirectUsers);
router.post("/:shortId/verify",verifyPassword);
module.exports=router;