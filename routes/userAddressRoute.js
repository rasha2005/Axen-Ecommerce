const express = require('express');
const userAddress_route = express();

const session = require("express-session");
userAddress_route.use(session({secret:process.env.SESSIONSECRET,resave:true,saveUninitialized:true,name:'userSession'}));

userAddress_route .set('views', './views/users');





const userAddressController = require('../controller/userAddressController')

const block = require('../middleware/checkBlockedStatus');
const auth = require('../middleware/userauth');

userAddress_route.get('/account',auth.isUserLogin,block.checkBlockedStatus,userAddressController.loadAccount);

userAddress_route.get('/savedAddress',auth.isUserLogin,block.checkBlockedStatus,userAddressController.loadSavedAddress);

userAddress_route.get('/addAddress',auth.isUserLogin,block.checkBlockedStatus,userAddressController.loadAddAddress);

userAddress_route.post('/addAddress',auth.isUserLogin,block.checkBlockedStatus,userAddressController.addAddr);

userAddress_route.get('/editAddress',auth.isUserLogin,block.checkBlockedStatus,userAddressController.loadEditAddress);

userAddress_route.post('/editAddress/:addressId',auth.isUserLogin,block.checkBlockedStatus,userAddressController.upadateAddress);

userAddress_route.get('/deleteAddress/:addressId',auth.isUserLogin,userAddressController.deleteAddress);


module.exports = userAddress_route;