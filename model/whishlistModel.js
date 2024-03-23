const mongoose = require("mongoose") ;

const wishlistSchema = new mongoose.Schema({

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    wishlistItems : [
        {
            productId :{
                type:mongoose.Schema.Types.ObjectId,
                ref:'product',
                required : true
            }
        }
    ]
});

module.exports = mongoose.model('Wishlist',wishlistSchema)