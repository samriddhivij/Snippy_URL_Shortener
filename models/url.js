const mongoose=require("mongoose");
const urlschema= new mongoose.Schema({
ShortId:{
    type:String,
    required:true,
    unique:true,
},
redirectURL:{
     type:String,
    required:true,
},
visitHistory:[{timestamp:{type:Number}}],
createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users",
},
isProtected:{
        type:Boolean,
        default:false
    },

password:{
        type:String,
        default:null
    }
},
{timestamps:true}

);

const URL=mongoose.model('url',urlschema)
module.exports=URL;