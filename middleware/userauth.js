const isUserLogin = async (req, res, next) => {
    try {
       console.log("hiii");
        if (req.session.user) {
            console.log("this user session",req.session.user)
        
           
            next();
        } else {
            console.log("redirecting...")
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {isUserLogin}