const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true

    },
    date : {
        type: Date, 
        default: Date.now 
    },
    

    address : 
        {
            name:{
                type:String,
                required:true
            },
            mobile:{
                type:String,
                required:true
            },
            pincode:{
                type:String,
                required:true
            },
            address : {
                type:String,
                required:true
            },
            city:{
                type:String,
                required:true
            }
        },

    product: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
              },

            name: {
                type: String,
                required:true
              },
              quantity: {
                type: Number,
                required:true
              },
              price: {
                type: String,
                required: true
              }, 
              totalPrice: {
                type:String,
                required:true
              },
              status : {
                type:String,
                default:"order Placed"
            },

        returnStatus:{
            type:String,
            enum:['return','accepted','rejected'],

           
        },
             
    }

        
    ],
    subtotal : {
        type:String,
        required:true
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'Cash on Delivery','wallet'], // define the allowed payment methods
        required: true
    },
    coupon:[
        {
        coupAmt : {
            type:Number
        },
        discoutAmt: {
            type:Number
        }
    }
],
    
       
     
    
   

})

module.exports = mongoose.model('Order',orderSchema);