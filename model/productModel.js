const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    pname:{
        type:String,
        required:true
    },
    description: {
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    color:{
        type:String,
        required:true

    },
    pimg:{
        type:Array,
        required:true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    is_list:{
        type:Number,
        default:1
    },
    createdAt: { type: Date, default: Date.now },

    productOffer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductOffer',
        
    },
    categoryOffer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoryOffer'
    },
   

});

module.exports = mongoose.model("Product",productSchema);
