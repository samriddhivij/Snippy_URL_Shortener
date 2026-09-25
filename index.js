const express=require("express");
const connecttomongodb=require("./connection");
const URL=require("./models/url")
const app=express();
const cookieParser=require("cookie-parser");
const {CheckForAuthentication,restrictTo}=require("./middleware/auth")
const {handleRedirectUsers,syncVisitsToMongoDB}=require("./middleware/redirect")

const path=require("path");

connecttomongodb("mongodb://127.0.0.1:27017/urlapp").then(()=>{
    console.log("sanyam mongo db connected this side");
})
//for ejs files to connect
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

//routing
const urlRoute=require("./routes/url");
const staticRoute=require("./routes/staticRouter");
const userRoute=require("./routes/user");

//middleware connection
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());


//soft checking for every routing
app.use(CheckForAuthentication);
//routing

app.get("/url/:shortId",handleRedirectUsers);
app.use("/url",restrictTo(["NORMAL"]),urlRoute);//hard checking
app.use("/",staticRoute);
app.use("/user",userRoute);


// Run the sync job every 3 minutes
setInterval(syncVisitsToMongoDB, 3 * 60 * 1000);
app.listen(8004,()=>console.log("server started"));
app.use(express.static(path.join(__dirname, "public")));//to connect css file

