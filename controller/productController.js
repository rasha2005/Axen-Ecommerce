
const category = require("../model/categoryModel");
const product = require("../model/productModel");
const productOffer = require("../model/productOfferModel");
const sharp = require('sharp');
const { default: mongoose } = require("mongoose");



const loadProduct = async(req,res) => {
    try{
        
            
        const proData = await product.find({ is_list: 1 })
        .populate({
            path: 'category',
            match: { is_list: 1 }
        })
        .sort({ createdAt: -1 })  
        .exec();
    
        const filteredProData = proData.filter(product => product.category);
        console.log("filteredProData",filteredProData);

              res.render('products',{product:filteredProData,req});
               
    }catch (error) {
        console.log(error.message);
    }
}

const addProduct = async(req,res) => {
    try{
  
      
        

        const catData = await category.find()        
    res.render('addProduct');
    }catch (error) {
        console.log(error.message);
    }
}

const addPro = async (req, res) => {
    try {
     
        const productName = req.body.pname.trim();
        if (!productName) {
            return res.render('addProduct', { message: 'Product title is required' });
        }

        // Check if product title already exists
        const existingProduct = await product.findOne({ pname: productName });
        if (existingProduct) {
            return res.render('addProduct', { message: 'Product title already exists' });
        }

        // Validate if description is provided and does not contain only spaces
        const description = req.body.description.trim();
        if (!description) {
            return res.render('addProduct', { message: 'Description is required' });
        }

        // Validate if stock is a valid number
        const stock = req.body.stock.trim();
        if (!/^\d+$/.test(stock)) {
            return res.render('addProduct', { message: 'Stock should be a number' });
        }

        // Validate if price is a valid number
        const price = req.body.price.trim();
        if (!/^\d+(\.\d{1,2})?$/.test(price)) {
            return res.render('addProduct', { message: 'Price should be a number ' });
        }
       
        
        
        let arrImages = [];
        console.log(req.files);

        for (let i = 0; i < req.files.length; i++) {
            // Use sharp to resize and crop the image
            const croppedBuffer = await sharp(req.files[i].path)
                .resize({ width: 300, height: 300, fit: sharp.fit.cover })
                .toBuffer();

            const filename = `cropped_${req.files[i].originalname}`;
            arrImages[i] = filename;

            // Save the cropped image
            await sharp(croppedBuffer).toFile(`multer/catimages/${filename}`);
        }


        const prod = new product({
            pname: req.body.pname,
            description: req.body.description,
            price:parseFloat(price),
            stock: parseInt(stock),
            color: req.body.color,
            pimg: arrImages,
            category: req.body.category
        });

        const productData = await prod.save();
        console.log(productData);

        if (productData) {
            res.redirect('/admin/products');
        } else {
            res.render('addProduct', { message: "Something went wrong" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadList = async(req,res) => {
    try{
        const proData = await product.find({ is_list: 0 }).populate('category');
        res.render('list',{product:proData});
    }catch (error) {
        console.log(error.message);
    }
}

const updateIsList = async (req, res) => {
    try {
        const productId = req.body.productId;
        console.log(productId);

        console.log("hey");

        await product.updateOne({ _id: productId }, { $set: { is_list: 0 } });

        res.redirect('/admin/products');

        // res.status(200).send('Product added to list successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

const toggleIsList = async(req,res) => {
    try{

        const productId = req.body.productId;

        await product.updateOne({_id:productId},{$set:{is_list:1}});

        res.redirect('/admin/list')
    }catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}


    const loadEditProduct = async(req,res) => {
        try {
            
            

            const productId = req.params.productId;
            

            const proData = await product.findById(productId);
            const catData = await category.find({is_list:1});

            if(!proData){
                console.log("no such data");
            }else{
                console.log("got the data")
            }
            


        res.render('editProduct',{product:proData,categories:catData});
        }catch (error) {
            console.log(error.message);
        }
    }

    const updateProduct = async(req,res) => {
        try {
            console.log("is it coming here?");
            console.log(" req.body.category;", req.body.category);
            const productId = req.params.productId;

            const proData = await product.findById(productId);
            const catData = await category.find();

            const productName = req.body.pname.trim();
        if (!productName) {
            return res.render('editProduct', { message: 'Product title is required',
            product:proData,categories:catData});
        }

        

        // Validate if description is provided and does not contain only spaces
        const description = req.body.description.trim();
        if (!description) {
            return res.render('editProduct', { message: 'Description is required',
            product:proData ,categories:catData});
        }

        // Validate if stock is a valid number
        const stock = req.body.stock.trim();
        if (!/^\d+$/.test(stock)) {
            return res.render('editProduct', { message: 'Stock should be a number',
            product:proData,categories:catData });
        }

        // Validate if price is a valid number
        const price = req.body.price.trim();
        if (!/^\d+(\.\d{1,2})?$/.test(price)) {
            return res.render('editProduct', { message: 'Price should be a number ',
            product:proData,categories:catData });
        }
       
        
        
           
            const existingProduct = await product.findById(productId);
            if (req.files && req.files.length > 0) {
                existingProduct.pimg = req.files.map(file => file.filename);
            } else {
                // If no new images are uploaded, retain existing images
                if (existingProduct.pimg && existingProduct.pimg.length > 0) {
                    // If there are existing images, keep them
                    existingProduct.pimg = existingProduct.pimg;
                } else {
                    // If no existing images and no new images, set pimg to an empty array or null
                    existingProduct.pimg = [];
                    // or existingProduct.pimg = null; depending on your preference
                }
            }
    
            existingProduct.pname = req.body.pname;
            existingProduct.description = req.body.description;
            existingProduct.price = req.body.price;
            existingProduct.stock = req.body.stock;
            existingProduct.color = req.body.color;
           
            existingProduct.category = req.body.category;

            const updatedProduct = await existingProduct.save();

            console.log(updatedProduct);

            if(updatedProduct) {
                res.redirect('/admin/products')
            }else {
                res.render('editProduct')
            }

            res.redirect('/admin/product')
        }catch (error) {
            console.log(error.message);
        }
    }

    const deleteImage = async (req, res) => {
        try {
            console.log("hii,its in the delete controll")
            const productId = req.params.productId;
            const imageName = req.params.imageName;
            
    console.log("productId",productId);
            // Find the product by ID
            const products = await product.findById(productId);
            console.log("products",products);
    
            if (!products) {
                return res.status(404).json({ success: false, error: 'Product not found' });
            }
     console.log('imageName',imageName)
            // Remove the image from the product's images array
            const index = products.pimg.indexOf(imageName);
            if (index !== -1) {
                products.pimg.splice(index, 1);
            } else {
                return res.status(404).json({ success: false, error: 'Image not found in product' });
            }
    
            // Save the updated product
            await products.save();
    
            return res.status(200).json({ success: true });
            
        } catch (error) {
            console.error('Error in deleteImage:', error);
           
        }
    };
    

    const loadProductOffer = async(req,res,next) => {

        try{

            const Product  = await productOffer.find().populate('product');

            res.render('productOffer',{pro:Product})

        }catch (error) {
            next(error);
        }
    }

    const loadAddProductOffer = async(req,res,next) => {

        try{

            const Product = await product.find()

            res.render('addProductOffer',{pro:Product});

        }catch (error) {
            next(error);
        }
    }

    const addProductOffer = async(req,res,next) => {

        try{

            const pro = await product.find()
            console.log("pro",pro);

            const productName = req.body.product.trim();
            const offer = req.body.offer.trim();
            console.log("offer",offer);
            console.log("productName",productName)
            if (!offer) {
                return res.render('addProductOffer', { message: 'offer is required' ,pro:pro});
            }
            if(offer < 0 ) {
                return res.render('addProductOffer', {message:'offer should not be a negative number',
                pro:pro
            })
            }
           
            if (!/^\d+$/.test(offer)) {
                return res.render('addProductOffer', {
                    message: 'Offer must be a number',
                    pro:pro
                });
            }
    
            // Check if product title already exists
            const existingProduct = await productOffer.findOne({ product: productName });
            console.log("existingProduct",existingProduct);
            if (existingProduct) {
                return res.render('addProductOffer', { message: 'Product title already exists' ,pro:pro});
            }
            
        
            

            const proOffer = new productOffer({
                product:req.body.product,
                productOfferAmt:req.body.offer
            })

            const proData = await proOffer.save();
            console.log("proData",proData);

            const Product = await product.findById(req.body.product);
            console.log('productccdvsdv',Product);

           
            Product.productOffer = proData._id;
          

            await Product.save();

            res.redirect('/admin/productOffer')
            

        }catch(error) {
            next(error);
        }
    }

    const loadEditProOffer = async(req,res,next) => {
        try{

            const id = new mongoose.Types.ObjectId(req.query.id);
        console.log("couponID",id);
        const offer = await productOffer.findOne({_id:id});
        console.log("couponnbhj",offer);

            res.render('editProductOffer',{proOffer:offer})

        }catch (error) {
            next(error);
        }
    }

    const updateProOffer = async(req,res,next) => {
        try{
            console.log("hii");
            const id = new mongoose.Types.ObjectId(req.query.id);
            const off = await productOffer.findOne({_id:id});
            const offer = req.body.offer;
            if(offer < 0 ) {
                return res.render('editProductOffer', {message:'offer should not be a negative number',
                proOffer:off
            })
            }
            if(!offer) {
                return res.render('editProductOffer', {message:'offer is required',
                proOffer:off
            })
            }
            if (!/^\d+$/.test(offer)) {
                return res.render('editProductOffer', {
                    message: 'Offer must be a number',
                    proOffer: off
                });
            }
            off.productOfferAmt = offer;
            await off.save();

            res.redirect('/admin/productOffer')

        }catch (error) {
            next(error);
        }
    }

    const deleteOffer = async(req,res,next) => {
        try{

            console.log("heee");
            const id = new mongoose.Types.ObjectId(req.params.id);

            const offer = await productOffer.findByIdAndDelete({_id:id})
            

            res.status(200).json({success : true ,deletedProductOffer:id})

        }catch (error) {
            next(error);
        }
    }
 
    module.exports = {
        loadProduct,
        addProduct,
        addPro,
        loadList,
        updateIsList,
        toggleIsList,
        loadEditProduct,
        updateProduct,
        deleteImage,
        loadProductOffer,
        loadAddProductOffer,
        addProductOffer,
        deleteOffer,
        loadEditProOffer,
        updateProOffer
        
    }

    