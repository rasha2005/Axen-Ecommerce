const mongoose  = require("mongoose");

const userAddressSchema  = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    pincode:{
        type:String,
        required:true
    },
    address : {
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    }

});

module.exports = mongoose.model('Addresse',userAddressSchema);