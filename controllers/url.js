//to  shorten url if user logged in then only it inserts,then shows generated urls and redirect to home page
const shortid=require("shortid");
const URL=require("../models/url")
const QRCode = require("qrcode");
const bcrypt = require("bcrypt");

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





async function verifyPassword(req, res) {

    const shortId = req.params.shortId;

    const entry = await URL.findOne({
        ShortId: shortId
    });

    if (!entry) {
        return res.status(404).send("URL not found");
    }

    const ok = await bcrypt.compare(
        req.body.password,
        entry.password
    );

    if (!ok) {

        return res.render("verifyPassword", {
            shortId: shortId,
            message: "Incorrect password"
        });

    }

    await URL.findOneAndUpdate(
        { ShortId: shortId },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now()
                }
            }
        }
    );

    return res.redirect(entry.redirectURL);
}


module.exports={handleNewShortUrl,verifyPassword}
