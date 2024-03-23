const express = require('express');
const cartRoute = express();

const session = require("express-session");
cartRoute.use(session({secret:process.env.SESSIONSECRET,resave:true,saveUninitialized:true,name:'userSession'}));





const block = require('../middleware/checkBlockedStatus');
const cartController = require('../controller/cartController')

cartRoute .set('views', './views/users');

cartRoute.get('/cart',block.checkBlockedStatus,cartController.loadCart);

cartRoute.post('/cart',block.checkBlockedStatus,cartController.addProductToCart);

cartRoute.post('/updateQuantity',block.checkBlockedStatus,cartController.updateQuantity)


cartRoute.get('/remove/:productId',cartController.removeProductFromCart);

cartRoute.get('/wishlist',cartController.loadWishlist);

cartRoute.post('/addtowish',cartController.addToWishlist);

cartRoute.delete('/removeWishlist',cartController.removeWishlist)

module.exports = cartRoute