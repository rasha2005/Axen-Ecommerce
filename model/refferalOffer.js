const mongoose = require('mongoose');

const reffaralOfferSchema = new mongoose.Schema({

    refferalBonus : {
        type : String,
        required:true
    },
    refferalSign : {
        type:String,
        required:true
    }
});

module.exports = mongoose.model("refferalOffer",reffaralOfferSchema)