const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({

    category : {
         type:String,
         required:true
    },
    img : {
        type:String,
        required:true
    },
    
    is_list: {
        type:Number,
        default:1
    },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Category',categorySchema);