const express = require('express');
const user_route = express();

const session = require("express-session");
user_route.use(session({secret:process.env.SESSIONSECRET,resave:true,saveUninitialized:true,name:'userSession'}));


user_route .set('views', './views/users');





// const auth = require('../middleware/userauth');
// const sess = require('../middleware/usermiddleware')

const block = require('../middleware/checkBlockedStatus');
const auth = require('../middleware/userauth');
const cart = require('../middleware/cartQuantity')

const userController = require("../controller/userController");
user_route.get('/',block.checkBlockedStatus,cart.addCartCountToSession,userController.loadHome)

user_route.get('/Home',block.checkBlockedStatus,cart.addCartCountToSession,userController.loadHome)



user_route.get('/login',userController.loadLogin);

user_route.get('/register',userController.loadRegister);

user_route.post('/register',userController.insertUser);

user_route.post('/otp-page',userController.validateOTPAndInsertUser);


user_route.post('/resend-otp',userController.resendOTP);

user_route.post('/',userController.verifyLogin);

user_route.get('/logout',userController.logout);

user_route.get('/details',block.checkBlockedStatus,userController.loadProDetails);




user_route.get('/accountDetails',auth.isUserLogin,block.checkBlockedStatus,userController.loadAccountDetails);

user_route.get('/changePassword',auth.isUserLogin,block.checkBlockedStatus,userController.loadChangePassword);

user_route.post('/changePassword',userController.changePassword);

user_route.get('/checkout',auth.isUserLogin,block.checkBlockedStatus,userController.loadCheckoutPage);

user_route.post('/createRazorpayOrder/',userController.createRazorpayOrder)

user_route.post('/verifyCoupon',userController.verifyCoupon);

user_route.post('/removeCoupon',userController.removeCoupon);

user_route.get('/editAccountDetails',auth.isUserLogin,block.checkBlockedStatus,userController.loadEditAccountDetails);

user_route.post('/editAddressDetails/:userId',auth.isUserLogin,block.checkBlockedStatus,userController.updateAccountDetails);

user_route.get('/wallet',userController.loadUserWallet);

user_route.get('/addFund',userController.loadAddFund);

user_route.post('/walletRazorPay/',userController.walletRazorPay);



user_route.post ('/addFund',userController.addFund);

user_route.get('/refferalOffer',auth.isUserLogin,block.checkBlockedStatus,userController.laodRefferalOffer);

user_route.get('/shop',userController.loadShop);

user_route.get('/filterProduct',userController.filterProduct);

user_route.get('/resetPasswordEmail',userController.loadForgotPassword);

user_route.post('/resetOtp',userController.validateresetEmail);

user_route.post('/ressetPassword',userController.ressetPasssword);

user_route.post('/resetOtpValidation',userController.resetOTP)













// user_route.post('/cart/remove/:productId',userController.removeProductFromCart);





module.exports = user_route;