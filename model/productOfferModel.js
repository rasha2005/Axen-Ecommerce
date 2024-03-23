const mongoose = require("mongoose");

const productOfferSchema = new mongoose.Schema({

    product :{
        type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
    },
    productOfferAmt: {
        type:Number,
        required:true,
        default:0
    }
    
})

module.exports = mongoose.model('ProductOffer',productOfferSchema);