const User = require('../model/userModel');

  
const checkBlockedStatus = async (req, res, next) => {
    try {
        if (req.path === '/admin-dashboard') {
            return next();
        }

        if (req.session.user) {
            const user = await User.findById(req.session.user._id);

            if (user && user.role === 'admin') {
                return next(); // Skip blocking check for admins
            }

            if (user && user.is_blocked) {
                // User is blocked, invalidate session
                delete req.session.user;
                console.log("is there admin", req.session);
                return res.render('login', { message: "you have been blocked" });
            }
        }
        next(); // Continue with the regular flow if not blocked or not logged in
    } catch (error) {
        console.log('checkBlockedStatus middleware error:', error.message);
        next(); // Continue with the regular flow in case of an error
    }
};

module.exports = { checkBlockedStatus };
