const Cart = require('../model/cartModel')
const mongoose = require('mongoose');

const addCartCountToSession = async (req, res, next) => {
    if (req.session.user) {
        try {
            const cartCount = await Cart.aggregate([
                {
                    $match: { user: new mongoose.Types.ObjectId(req.session.user._id) }
                },
                {
                    $unwind: "$cartItems" // Deconstructs the cartItems array
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 } // Counts the number of productId
                    }
                }
            ]);
            const count = cartCount.length > 0 ? cartCount[0].count : 0;
            req.session.user.count = count;
            console.log("hii from the middleware")
        } catch (err) {
            // Handle error if necessary
            console.error("Error while calculating cart count:", err);
        }
    }
    next(); // Move to the next middleware
};

module.exports = { addCartCountToSession };