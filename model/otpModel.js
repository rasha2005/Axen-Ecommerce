const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60, // Set the expiration time in seconds
    }
});

module.exports = mongoose.model('Otp', otpSchema);
