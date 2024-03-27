
const category = require("../model/categoryModel");
const categoryOffer = require("../model/categoryOfferModel");
const product = require("../model/productModel")
const mongoose = require('mongoose');
const sharp = require('sharp');



const loadCategory = async(req,res) => {
    try{

        
            
            const catData = await category.find({is_list:1})
            res.render('category',{req});
         
      
    }catch (error) {
        console.log(error.message);
    }
}

const addCategory = async(req,res) => {
    try{
        res.render('addCategory');

    }catch (error) {
        console.log(error.message);
    }
}

const addCat = async(req,res) => {
    try{ 
      
        

        const categoryName = req.body.category.trim();
        console.log("categoryName",categoryName);
        if (!categoryName) {
            return res.render('addCategory', { message: 'Category name is required' });
        }
         // Check if category contains only characters (no numbers or special characters)
         const validCategoryName = /^[a-zA-Z\s]+$/.test(categoryName);
         if (!validCategoryName) {
             return res.render('addCategory', { message: 'Category name should contain only characters' });
         }
       
         const existingCategory = await category.findOne({category: { $regex: new RegExp("^" + categoryName + "$", "i") } });
         console.log("existingCategory",existingCategory);
         if (existingCategory) {
            return res.render('addCategory', { message: 'Category name already exists' });
        }
 
        // Validate if an image file is uploaded
        if (!req.file || !req.file.filename) {
            return res.render('addCategory', { message: 'Image is required' });
        }
        let arrImages 
        console.log(req.file);

        if (req.file) {
            // Use sharp to resize and crop the image
            const croppedBuffer = await sharp(req.file.path)
                .resize({ width: 300, height: 300, fit: sharp.fit.cover })
                .toBuffer();

            const filename = `cropped_${req.file.originalname}`;
            arrImages = filename;

            // Save the cropped image
            await sharp(croppedBuffer).toFile(`multer/catimages/${filename}`);
        }
       
        

        const cat = category({
            category:req.body.category,
            img:arrImages
           
        });

        const catData = await cat.save();
        console.log(catData)

        if(catData) {
            res.redirect('/admin/category')
        }else{
            res.render('addCategory',{message:'something went wrong'});
        }

    }catch (error){
        console.log(error.message);
    }
}

const loadlistCategory = async(req,res) => {
    try{
        const cate = await category.find({ is_list: 0 });
        res.render('listCategory',{categories:cate});
    }catch (error) {
        console.log(error.message);
    }
    }

    const CatupdateIsList = async (req, res) => {
        try {
            const categoriesId = req.body.categoriesId;
            console.log("categoriesId",categoriesId);

    
            console.log("hey");
    
            await category.updateOne({ _id: categoriesId }, { $set: { is_list: 0 } });
    
            res.redirect('/admin/category');
    
            // res.status(200).send('Product added to list successfully');
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    };

    const catToggleIsList = async(req,res) => {
        try{
    
            const categoriesId = req.body.categoriesId;
            console.log("categoriesId",categoriesId);
    
            await category.updateOne({_id:categoriesId},{$set:{is_list:1}});
    
            res.redirect('/admin/listCategory')
        }catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    const loadEditCategory = async(req,res) => {

        try{

            const categoryId = req.params.categoryId;
            const catData = await category.findById(categoryId);
            console.log("catDta:",catData);

            if(!catData) {
                console.log("no such data");
            }else{
                console.log("got the data")
            }
            // console.log(catData)
             // Fetch related products for the category
             
 
            res.render('editCategory',{categories:catData});
        }catch (error) {
            console.log(error.message);
        }
       

    }

    const upadateCategory = async(req,res) => {
        try {

            const categoryid = req.params.categoryId;
            const catData = await category.findById(categoryid);
            console.log("catDta:",catData);


        const categoryName = req.body.category.trim();
        console.log("categoryName",categoryName);

            

        if (!categoryName) {
            return res.render('editCategory', { message: 'Category name is required',categories:catData });
        }
         // Check if category contains only characters (no numbers or special characters)
         const validCategoryName = /^[a-zA-Z\s]+$/.test(categoryName);
         if (!validCategoryName) {
             return res.render('editCategory', { message: 'Category name should contain only characters' ,categories:catData});
         }
        
        // Check if category already exists
        // const existingCat = await category.findOne({ category: categoryName });
        // if (existingCat) {
        //     return res.render('editCategory', { message: 'Category already exists' ,categories:catData});
        // }

        // Validate if an image file is uploaded
       
        
             
          

            const existingcat = await category.findOne({_id:categoryid});

            if(!existingcat) {
                console.log("no category found")
            }else  if(categoryid != existingcat.category){
                // Update the category name
                existingcat.category = req.body.category;
            
                // Check if a new image is uploaded
            }if (req.file) {
                    // If a new image is uploaded, update the image field
                    existingcat.img = req.file.filename;
                } else 
                    // If no new image is uploaded, retain the existing image
                    if (existingcat.img) {
                        // If an existing image exists, keep it
                        existingcat.img = existingcat.img;
                    } else {
                        // If no existing image and no new image, handle as needed (e.g., set to null)
                        existingcat.img = null; // or set to an empty string, depending on your preference
                    }
                



            const updatedCategory = await existingcat.save();

            console.log(updatedCategory);

            if(updatedCategory){
                res.redirect('/admin/category');
            }
        
            

        }    catch (error) {
            console.log(error.message);
        }
    }

    const loadCategoryOffer = async(req,res,next) => {

        try{

            const catOffer = await categoryOffer.find().populate('category');

            console.log("catOffer",catOffer);

            res.render('categoryOffer',{CatOffers:catOffer,req})

        }catch (error){
            next(error);
        }
    }

    const loadAddCategoryOffer = async(req,res,next) => {

        try{

            const Category = await category.find();


            res.render('addCategoryOffer',{category:Category});

        }catch (error) {
            next(error);
        }
    }

    const addCategoryOffer = async(req,res,next) => {

        try{

            const Category = await category.find();
            const offer = req.body.offer
            const existingCategory =   await categoryOffer.findOne({category:req.body.cate});
            console.log("exixtingCategory",existingCategory);
            if(existingCategory) {
                return res.render('addCategoryOffer',{message : 'category title already exists',category:Category})
            }
            if(!offer) {
                return res.render('addCategoryOffer',{message : 'offer is required',category:Category})
            }
            if(offer < 0 ) {
                return res.render('addCategoryOffer', {message:'offer should not be a negative number',
                category:Category
            })
           
            }
            if(offer > 70) {
                return res.render('addCategoryOffer', {message:'offer is above the limit',
                category:Category
            })
        }
            if (!/^\d+$/.test(offer)) {
                return res.render('addCategoryOffer', {
                    message: 'Offer must be a number',
                    category:Category
                });
            }

            const catOffer = new categoryOffer({
                category:req.body.cate,
                categoryofferAmt:req.body.offer
            })
    console.log("req.body.offer",req.body.cate)
            const catData = await catOffer.save();
            console.log("catData",catData);
            const pro = await product.find({category: req.body.cate});
            console.log("pro",pro);

            for (const product of pro) {
                product.categoryOffer = catData._id;
                await product.save();
            }


           
    
            res.redirect('/admin/categoryOffer');
            

        }catch (error) {
            next(error);
        }
    }

    const deleteOffer = async(req,res,next) => {
        try{
            console.log("hiii");
            const offerId = new mongoose.Types.ObjectId(req.params.offerId);
            console.log("offerId",offerId);

            const offer = await categoryOffer.findByIdAndDelete({_id:offerId});
            console.log("offer",offer);

            res.status(200).json({success:true,deletedOfferId:offerId});

        }catch (error) {
            next(error);
        }
    }

    const loadEditOffer = async(req,res,next) => {
        try{
            const id = new mongoose.Types.ObjectId(req.query.id);
            console.log("id",id);
            const offer = await categoryOffer.findOne({_id:id});
            console.log("offer",offer);
            // const cat = await category.find();
            res.render('editCategoryOffer',{offer:offer});

        }catch (error) {
            next(error);
        }
    }

    const upadateOffer = async(req,res,next) => {
        try{

            const id = new mongoose.Types.ObjectId(req.query.id);
            const off = await categoryOffer.findOne({_id:id})
            console.log("off",off)
            const offer = req.body.offer
          
            if(offer < 0 ) {
                return res.render('editCategoryOffer', {message:'offer should not be a negative number',
                offer:off
            })
            }

            if(offer > 70 ) {
                return res.render('editCategoryOffer', {message:'offer is above the limit',
                offer:off
            })
            }
            if(!offer) {
                return res.render('editCategoryOffer', {message:'offer is required',
                offer:off
            })
            }
          
            if (!/^\d+$/.test(offer)) {
                return res.render('editCategoryOffer', {
                    message: 'Offer must be a number',
                    offer: off
                });
            }
            off.categoryofferAmt = offer;
            await off.save();

            res.redirect('/admin/categoryOffer');

        }catch (error) {
            next(error);
        }
    }

    module.exports = {
        loadCategory,
        addCategory,
        addCat,
        loadlistCategory,
        CatupdateIsList,
        catToggleIsList,
        loadEditCategory,
        upadateCategory,
        loadCategoryOffer,
        loadAddCategoryOffer,
        addCategoryOffer,
        deleteOffer,
        loadEditOffer,
        upadateOffer
    }