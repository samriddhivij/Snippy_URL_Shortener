// const sessionIdtouserMap=new Map();//server refresh hote hi map khali ho jata hais so no storage of cookie

// function setUser(id,user){
//     sessionIdtouserMap.set(id,user);
// }
const jwt=require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SERVER_SECRET;
function setUser(user){
return jwt.sign(
    {
        tokenid: user._id,
        tokenemail: user.email,
        tokenrole: user.role,
    },
    secret,
    {
        expiresIn: "4d",
    }
);
}
// function getUser(id){
//     return sessionIdtouserMap.get(id);
// }
function getUser(token){
     if(!token){return null;}
   try{return jwt.verify(token,secret)}
   catch(error){return null;}
}
module.exports={
    setUser,
    getUser
}