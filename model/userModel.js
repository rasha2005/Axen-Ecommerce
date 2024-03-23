const mongoose  = require("mongoose");

const userSchema = new mongoose.Schema({
     
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
   
    password:{
        type:String,
        required:true
    },

    is_blocked:{
        type:Number,
        default:0
    },
    refferalOffer:{
        type:String
    }
});

userSchema.methods.blockUser = function () {
    this.is_blocked = 1;
    
    return this.save();
};

// Add a method to the schema for unblocking a user
userSchema.methods.unblockUser = function () {
    this.is_blocked = 0;
    return this.save();
};


module.exports = mongoose.model('User',userSchema);