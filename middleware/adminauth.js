const admin = require('../model/adminModel');

const isLogin = async (req, res, next) => {
    try {
       
        if (admin && req.session.admin) {
            console.log("this admin session",req.session.admin)
        
            // User is logged in, continue to the next middleware or route handler
            next();
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {isLogin}
