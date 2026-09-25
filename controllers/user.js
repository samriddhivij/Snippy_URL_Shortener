
const User=require("../models/user")
// const {v4:uuidv4}=require("uuid");
const {setUser}=require("../service/auth")//for handleUserLogin
async function handleUserSignUp(req,res){
    const{name,email,password}=req.body;
    await User.create({
        name,
        email,
        password, 
    });
    return res.redirect("/");
}

    async function handleUserLogIn(req,res){
    const{email,password}=req.body;
    const user=await User.findOne({email,password});
    if(!user){return res.render("login",{
        message:"Incorrect email id or password"
    });
    }
    // const sessionId=uuidv4();//if log in details correct ,then we will give him unique id
    // setUser(sessionId,user);
    const token=setUser(user);
    // res.cookie("uid",sessionId);//
      res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 4 * 24 * 60 * 60 * 1000
});//yes browser meh bhi cookie meh we can send token also instead of uid
      console.log("verified");
      return res.redirect("/");
    // return res.json({token});//for api calling
    }
module.exports={
    handleUserSignUp,handleUserLogIn
}