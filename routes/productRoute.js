const express = require("express");
const product_route = express();


const session =  require("express-session");

product_route.use(session({secret:process.env.SESSIONSECRET,resave:true,saveUninitialized:true,name: 'adminSession'}));



product_route .set('views', './views/admin');




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

})
const upload = multer({storage:storage});
const productController = require('../controller/productController');
const auth = require('../middleware/adminauth');

product_route.get('/products',auth.isLogin, productController.loadProduct);

product_route.get('/addProduct',productController.addProduct);

product_route.post('/addProduct',upload.array('pimg',5),productController.addPro);

product_route.get('/list',productController.loadList);

product_route.post('/unlist',productController.updateIsList);

product_route.post('/list',productController.toggleIsList);

product_route.get('/products',productController.updateIsList);

product_route.get('/list',productController.toggleIsList);

product_route.get('/editProduct/:productId',productController.loadEditProduct);

product_route.post('/editProduct/:productId',upload.array('pimg', 5),productController.updateProduct);

product_route.delete('/deleteImage/:productId/:imageName', productController.deleteImage);

product_route.get('/productOffer',auth.isLogin, productController.loadProductOffer);

product_route.get('/addProductOffer',auth.isLogin, productController.loadAddProductOffer);

product_route.post('/addProductOffer', productController.addProductOffer);

product_route.get('/editProductOffer',auth.isLogin, productController.loadEditProOffer);

product_route.post('/updateProOffer',productController.updateProOffer)

product_route.delete('/deleteProOffer/:id',productController.deleteOffer)

module.exports = product_route;