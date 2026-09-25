const express=require("express");
const router=express.Router();

const{handleUserSignUp,handleUserLogIn}=require("../controllers/user");

router.post("/",handleUserSignUp);
router.post("/login",handleUserLogIn);

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    return res.redirect("/login");
});

module.exports=router;