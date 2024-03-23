const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema ({
    code:{
        type:String,
        required:true
    },
    description: {
        type:String,
        required:true
    },
    maxAmt :{
        type:String,
        required:true
    },
    couponAmt : {
        type:String,
        required:true
    },
    startDate:{
        type:String,
        required:true
    },
    endDate:{
        type:String,
        required:true
    }


})

module.exports = mongoose.model('Coupon',couponSchema);

