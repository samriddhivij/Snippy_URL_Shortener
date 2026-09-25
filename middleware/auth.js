const {getUser}=require("../service/auth");
const User=require("../models/user");
//soft middleware//clean code
 function CheckForAuthentication(req,res,next){
    // const authorizationHeader=req.headers["authorization"];
    const tokenCookie=req.cookies?.token;//for browser
    req.user=null;
    // if(!authorizationHeader||authorizationHeader.startWith("Bearer")){
    //     return next();
    // }
    if(!tokenCookie){
        return next();
    }

    // const token=authorizationHeaders.split("Bearer ")[1];
    const token=tokenCookie;

    const user=getUser(token);
    req.user=user;
    return next();
}
//as it will come after passing from soft middleware so user can be null or something (only 2 possiblity)
//hard middleware as it redirect to login page if find suspicious or unauthorized user
function restrictTo(roles=[]){
    return async function(req,res,next){//closure
      
        if(!req.user){return res.redirect("/login");}
      
      const exist = await User.findById(req.user.tokenid);
    if(!exist){
    
        res.clearCookie("token");
        return res.redirect("/login");}
        if(!roles.includes(req.user.tokenrole)){return res.end("UNAUTHORIZED");}
            next();
};
}
module.exports={
   CheckForAuthentication,
   restrictTo
}
