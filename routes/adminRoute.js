const express = require("express");
const admin_route = express();


const session =  require("express-session");

admin_route.use(session({secret:process.env.SESSIONSECRET,resave:true,saveUninitialized:true,name: 'adminSession'}));



admin_route .set('views', './views/admin');
     
const adminController = require('../controller/adminController');
const auth = require('../middleware/adminauth');

admin_route.post('/createAdmin',adminController.createAdmin);

admin_route.get('/',adminController.loadAdminLogin);

admin_route.post('/dashboard',adminController.verifyAdminLogin);

admin_route.get('/dashboard',adminController.loadDashboard);

admin_route.get('/customers',auth.isLogin,adminController.loadCustomer);

admin_route.get('/admin',adminController.adminlogout);

admin_route.get('/Order',auth.isLogin,adminController.loadOrder);

admin_route.get('/orderDetails/:orderId',adminController.loadOrderDetail);

admin_route.post('/updateOrderStatus/:productId', adminController.updateOrderStatus);

admin_route.get('/coupon',auth.isLogin,adminController.loadCoupon);

admin_route.get('/addCoupon',auth.isLogin,adminController.loadAddCoupon);

admin_route.post('/addCoupon',adminController.addCoupon)

admin_route.delete('/deletecoup/:couponId',adminController.deleteCoupon);

admin_route.get('/editCoupon/:couponId',adminController.loadEditCoupon);

admin_route.post('/updateCoupon/:couponId',adminController.updateCoupon);

admin_route.patch('/reqAccepted/:orderId/:productId',adminController.reqAccepted);

admin_route.patch('/reqRejected/:orderId/:productId',adminController.reqRejected);

admin_route.get('/refferalOffer',auth.isLogin,adminController.loadRefferalOffer);

admin_route.get('/editRefferal/:refferalId',adminController.loadEditRefferal)

admin_route.post('/updateReff/:reffID',adminController.editRefferalOffer);

admin_route.get('/salesReport',adminController.loadSalesReport);

admin_route.post('/filterSales',adminController.filterData);

admin_route.get('/generatePdf',adminController.generatePdf);










const User = require('../model/userModel');

// Define a route to block a user
admin_route.post('/block-user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Block the user
        await user.blockUser();

        return res.json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error('Error blocking user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Define a route to unblock a user
admin_route.post('/unblock-user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Unblock the user
        await user.unblockUser();

        return res.json({ message: 'User unblocked successfully' });
    } catch (error) {
        console.error('Error unblocking user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = admin_route;