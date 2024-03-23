const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    cartItems: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
          },
          quantity: {
            type: Number,
            default: 1
          },
          price: {
            type: String,
            // required: true
          },
          totalPrice: {
            type: String,
            // required:true
}
        
        }
      
      ],
      subtotal : {
        type:String,
      
        required:true
      },
      categoryOffer : {
        type:String
      },
      productOffer: {
        type:String
      }

});

module.exports = mongoose.model('Cart',cartSchema)