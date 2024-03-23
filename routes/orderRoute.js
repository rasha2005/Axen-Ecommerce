const express = require('express');
const order_route = express();

const session = require("express-session");
order_route.use(session({secret:process.env.SESSIONSECRET,resave:true,saveUninitialized:true,name:'userSession'}));


order_route .set('views', './views/users');


// const auth = require('../middleware/userauth');
// const sess = require('../middleware/usermiddleware')

const block = require('../middleware/checkBlockedStatus');
const auth = require('../middleware/userauth');

const orderController = require('../controller/orderController');
const { Module } = require('module');

order_route.post('/checkout',block.checkBlockedStatus,orderController.orderPlaced);

order_route.post('/OrderPlaced',orderController.loadOrderPlaced);



order_route.get('/Orders',auth.isUserLogin,block.checkBlockedStatus,orderController.loadOrder);

order_route.get('/orderDetail/:productId/:orderId',auth.isUserLogin,block.checkBlockedStatus,orderController.orderDetails);

order_route.get('/cancelOrder/:orderId/:productId',auth.isUserLogin,orderController.loadCancelOrder);

order_route.post('/cancel',orderController.cancelOrder);

order_route.patch('/returnHandle/:orderId/:productId',orderController.handleReturn);

order_route.get('/downloadInvoice/:orderId/:productId',auth.isUserLogin,block.checkBlockedStatus,orderController.downloadInvoice)


module.exports = order_route;