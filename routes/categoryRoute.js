const express = require("express");
const category_route = express();


const session =  require("express-session");

category_route.use(session({secret:process.env.SESSIONSECRET,resave:true,saveUninitialized:true,name: 'adminSession'}));

category_route .set('views', './views/admin');


const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination:function(req,file,cb){
       cb(null,path.join(__dirname,'../multer/catimages'))
    },
    filename:function(req,file,cb) {
        if (file && file.originalname) {
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    } else {
        cb(new Error('File object or originalname property is undefined.'));
    }
}

});
const upload = multer({storage:storage});
const categoryController = require('../controller/categoryController');
const auth = require('../middleware/adminauth');

category_route.get('/category',categoryController.loadCategory);

category_route.get('/addCategory',auth.isLogin,categoryController.addCategory);

category_route.post('/addCategory',upload.single('img'),categoryController.addCat);

category_route.get('/listCategory',categoryController.loadlistCategory);

category_route.post('/catUnlist',categoryController.CatupdateIsList);

category_route.post('/catlist',categoryController.catToggleIsList);

category_route.get('/category',categoryController.CatupdateIsList);

category_route.get('/listCategory',categoryController.catToggleIsList);

category_route.get('/editCategory/:categoryId',categoryController.loadEditCategory);

category_route.post('/editCategory/:categoryId',upload.single('img'),categoryController.upadateCategory);

category_route.get('/categoryOffer',auth.isLogin,categoryController.loadCategoryOffer)

category_route.get('/addCategoryOffer',auth.isLogin,categoryController.loadAddCategoryOffer)

category_route.post('/addCategoryOffer',categoryController.addCategoryOffer);

category_route.get('/editCategoryOffer',auth.isLogin,categoryController.loadEditOffer);

category_route.post('/updateOffer',categoryController.upadateOffer)

category_route.delete('/deleteOffer/:offerId',categoryController.deleteOffer);

module.exports = category_route;