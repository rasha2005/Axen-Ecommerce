const mongoose = require("mongoose");

const categoryOfferSchema = new mongoose.Schema ({

    category : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    categoryofferAmt : {
        type:Number,
        required:true,
        default:0
    }
})

module.exports = mongoose.model('CategoryOffer',categoryOfferSchema);

