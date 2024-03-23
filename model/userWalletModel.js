
const mongoose = require('mongoose');

const userWalletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    balance:{
        type:Number,
        default:0
    },
    trancsaction:[
        {
        amount:{
            type:String,
            default:0
        },
        status:{
            type:String
        },
        createdAt:{
            type:Date,
            default:Date.now()
        }
    }
]
})

module.exports = mongoose.model('Wallet',userWalletSchema);