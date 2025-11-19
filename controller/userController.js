const User = require('../model/userModel');
const Otp = require('../model/otpModel')
const category = require('../model/categoryModel');
const product = require('../model/productModel');
const Address = require('../model/userAddressModel');
const Coupon = require('../model/couponModel')
const Wallet = require('../model/userWalletModel')
const refferal  = require('../model/refferalOffer');
const shortid = require('shortid')
const categoryOffer = require('../model/categoryOfferModel')
const productOffer = require('../model/productOfferModel')
const mongoose = require('mongoose');
const Cart = require('../model/cartModel');
const Order = require('../model/orderModel');
const bcrypt = require('bcrypt');
const Wishlist = require('../model/whishlistModel')
const sendOTPByEmail = require('../services/sendemailotp');
const generateOTP = require('../services/generateOTP')
const validateOTP = require('../services/validateotp')
const { ObjectId } = require('mongodb');
const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY ,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});




const securePassword = async(password)=>{
    try {
        
        const hashedPassword = await bcrypt.hash(password,10);
        return hashedPassword;
    }catch (error) {
        console.log(error.message);
    }
}

const loadHome = async(req,res,next)=>{

    try {

        console.log("hhhhhhhhhh",req.session.user)
    //    
    let wishedProductIds = [];

    if (req.session.user) {
        const wishlist = await  Wishlist.findOne({ user: req.session.user._id });
    
        if (wishlist) {
            wishedProductIds = wishlist.wishlistItems.map(
                item => item.productId.toString()
            );
        }
    }
          const catData = await category.find({is_list:1})
        //   console.log(catData);
          
        const proData = await product.aggregate([
            {
                $match: { is_list: 1 }
            },
            {
                $lookup: {
                    from: "productoffers", 
                    localField: "productOffer",
                    foreignField: "_id",
                    as: "proOffer"
                }
            },
            {
                '$lookup': {
                  'from': 'categories', 
                  'localField': 'category', 
                  'foreignField': '_id', 
                  'as': 'catData'
                }
              }, {
                '$unwind': {
                  'path': '$catData'
                }
              }, {
                '$match': {
                  'catData.is_list': 1
                }
              },
              {
                '$lookup': {
                  'from': 'categoryoffers', 
                  'localField': 'categoryOffer', 
                  'foreignField': '_id', 
                  'as': 'catOffer'
                }
              }
        ])
       
        for (let i = 0; i < proData.length; i++) {
            // console.log("Product:", proData[i]);
            // console.log("proOffer:", proData[i]?.proOffer[0]);
            // console.log("Price:", proData[i].price);
            // console.log("catOffer:", proData[i]?.catOffer[0]);
        }
        const filteredProData = proData.filter(product => product.category !== null);
        // console.log("filteredProData",filteredProData);
        filteredProData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      


       
        
        const topPro = await Order.aggregate([
            {
              '$unwind': {
                'path': '$product'
              }
            },
            {
                '$lookup': {
                  'from': 'products',
                  'localField': 'product.productId',
                  'foreignField': '_id',
                  'as': 'productDetails'
                }
              },
              {
                '$match': {
                  'productDetails.is_list': 1
                }
              },
            {
              '$group': {
                '_id': '$product.productId',
                'count': {
                  '$sum': 1
                }
              }
            },

            {
              '$sort': { 'count': -1 } // Corrected: Sorting by the 'count' field in descending order
            },
            {
              "$limit": 10
            } 
          ]);

       console.log("topProducts",topPro);
       const productIds = topPro.map(product => product._id);
          console.log("productIds",productIds);
        
          const topProductsDetails = await product.aggregate([
            {
              $match: { "_id": { $in: productIds } } // Match product IDs in topProducts
            }
          ]);
          console.log("topProductsDetails",topProductsDetails);

         
     
        const topCat = await Order.aggregate([
            {
              '$unwind': {
                'path': '$product'
              }
            },
            {
                '$lookup': {
                  'from': 'products',
                  'localField': 'product.productId',
                  'foreignField': '_id',
                  'as': 'productDetails'
                }
              },
              {
                  $unwind: '$productDetails'
              },
              {
                  $lookup: {
                      'from': 'categories',
                      'localField': 'productDetails.category',
                      'foreignField': '_id', // Assuming 'category' is the correct field to match
                      'as': 'catDetails'
                  }
              },{
                '$match': {
                  'catDetails.is_list': 1
                }
              },
            {
              '$group': {
                '_id': '$catDetails._id',
                'count': {
                  '$sum': 1
                }
              }
            },

            {
              '$sort': { 'count': -1 } // Corrected: Sorting by the 'count' field in descending order
            },
            {
              "$limit": 10
            } 
          ]);

          console.log("jdjsbak",topCat)
          const catIds = topCat.map(product => product._id[0]);
          console.log("catIds",catIds);
        
          const topCatDetails = await category.aggregate([
            {
              $match: { "_id": { $in: catIds } } // Match product IDs in topProducts
            }
          ]);
          console.log("topProductsDetails",topCatDetails);
        res.render('home',{user:req.session.user, category:catData,product:filteredProData ,proffer:proData[0]?.proOffer[0],catoffer:proData[0]?.catOffer[0],topProductsDetails:topProductsDetails,topCatDetails:topCatDetails,wishedProductIds});
    }catch (error) {
        next(error);
        
    } 
}

const loadLogin = async(req,res, next)=>{
    try {
        // Check if a user is logged in 
        if (req.session.user) {
            // If user is logged in, fetch additional user details (if needed)
          
               

           return res.redirect('/')
        } else {
            console.log("userdfdsfsfs",req.session.user)
            // const cartcount = await Cart.aggregate([
            //     {
            //         $match : {user : req.session.user._id}
            //     },
            //     {
            //         $count:"totalItemsInCart"
            //     }
            //    ])
            //    console.log("cartcount",cartcount);

          
            res.render('login');
        }
    } catch (error) {
        next(error);
        
    }
};

const loadRegister = async(req,res,next)=>{
    try {
        delete req.session.forgot;
       console.log("req.session.forgot",req.session.forgot);
        if (req.session.user) {
            // If logged in, redirect to the home page
            res.redirect('/');
        } else {
            // If not logged in, render the login page
            res.render('register',{user:req.session.user});
        }
    } catch (error) {
        next(error);
        // Handle the error
        res.render('error', { error: 'An error occurred' });
    }
}


let existingEmail;
let otp;
let user;
let userData;
let globalEmail

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}


const insertUser = async(req,res,next)=>{
    try {

        const { name, email, mobile, password } = req.body;

        if (!name.trim() || !email.trim() || !mobile.trim() || !password.trim()) {
            return res.render('register', { message: 'Please enter valid values for all fields' });
        }

        if (!isValidEmail(email)) {
            return res.render('register', { message: 'Invalid email address' });
        }

        if (!email.endsWith('@gmail.com')) {
            return res.render('register', { message: 'Invalid email address' });
        }

        if (!/^\d{10}$/.test(mobile)) {
            return res.render('register', { message: 'Mobile number must be exactly 10 digits' });
        }

        if (password.length < 6) {
            return res.render('register', { message: 'Password must be at least 6 characters long' });
        }
        const specialCharacters = /[!@#$%^&*(),.?":{}|<>]/;
        if (!specialCharacters.test(password)) {
            return res.render('register', { message: 'Password must contain at least one special character' });
        }


         otp = generateOTP();
         console.log(otp);

        const spassword = await securePassword(req.body.password);

        existingEmail = await User.findOne({email:req.body.email});
        if(existingEmail){
            return res.render('register',{message:'email already in use'});
        }
        globalEmail = req.body.email;

          user = User({
            name:req.body.name,
            email:globalEmail,
            mobile:req.body.mobile,
            password:spassword,
            otp : otp
        });
 
      
       

        if(user) {

            const otpDocument = new Otp({
                otp:otp,
                email:req.body.email,
                user: user._id
            });
            await otpDocument.save()
            
        }


        console.log("req.query.refferal",req.query.refferal)
        req.session.refferal = req.query.refferal
        sendOTPByEmail(req.body.email, otp);

         // Redirect to the OTP entry page
         res.render('otp',{ user: req.session.user });
        } catch (error) {
            next(error);
           
            
        }
    };

const validateOTPAndInsertUser = async (req, res,next) => {
    try {

        



        const userProvidedOTP = req.body.otp;
        console.log("otp",otp);
        const storedUserData = await Otp.findOne({ email:globalEmail });
console.log("storedUserData",storedUserData);
        storedOtp = storedUserData.otp
        console.log("storedOtp",storedOtp);
        

        // Check if OTP matches the one sent to the user
        if (otp) {
            const isCorrectOTP = validateOTP(userProvidedOTP, storedOtp);
            console.log('Is Correct OTP?', isCorrectOTP);

            if (!isCorrectOTP) {
                return res.render('otp', { message: 'Invalid OTP' });
            }

            
           

            // // Continue with the rest of your code to save user data
            // const spassword = await securePassword(req.body.password);
            // const user = User({
            //     name: req.body.name,
            //     email: req.body.email,
            //     mobile: req.body.mobile,
            //     password: spassword,
            // });

            const userData = await user.save();
            console.log("userData",userData);
            const referralCode = shortid.generate();
            console.log(referralCode,"referralCode")
            userData.refferalOffer = referralCode
            await userData.save();
            const wallet  = new Wallet({
                user:userData._id,
                trancsaction:[]
            })
            console.log("wallet",wallet)
            await wallet.save();
            console.log("userData",userData);
            
            if(req.session.refferal){
                const reffUser = await User.find({refferalOffer:req.session.refferal});
                console.log("reffUser",reffUser)
                const userId = reffUser[0]._id;
                console.log("userId",userId);
                const wallet = await Wallet.findOne({ user: userId });
                console.log("waller",wallet);
                const Refferal = await refferal.find();
                console.log("Refferal",Refferal)
                console.log("Refferal.refferalBonus",Refferal[0].refferalBonus)
                
                wallet.balance += parseInt(Refferal[0].refferalBonus);

                console.log(" Wallet.balance1", wallet.balance)
                const newTransaction = {
                    amount:Refferal[0].refferalBonus,
                    status: 'credited',
                    createdAt:Date.now()
        
                };
                wallet.trancsaction.push(newTransaction);
                 
                // Push the new transaction object to the transactions array
                
                await wallet.save();
               
                const wallnew = await Wallet.findOne({user:userData._id});
                console.log("wallnew",wallnew);
                wallnew.balance +=parseInt( Refferal[0].refferalSign);

                console.log(" Wallet.balance2", wallnew.balance)
                const NewTransaction = {
                    amount:Refferal[0].refferalSign,
                    status: 'credited',
                    createdAt:Date.now()
        
                };
                wallnew.trancsaction.push(NewTransaction);
                await wallnew.save();
            }
                // Push the new transaction object to the transactions array
                
              
            

            if (userData) {
               
                req.session.user = userData;
               
               
                 res.redirect('/');
            } else {
                return res.render('register', { message: 'Your registration has failed' });
            }
        } else {
            console.log('Generated OTP is undefined');
            return res.render('otp', { message: 'Invalid OTP' });
        }
    
    
    } catch (error) {
        next(error);
        return res.render('otp', { message: 'An error occurred during validation' });
    }
};

const resendOTP = async (req, res,next) => {
    try {
        // const userEmail = req.body.email;
        // if (!userEmail) {
        //     return res.render('otp', { message: 'Invalid email' });
        // }
        

        // Generate a new OTP
         otp = generateOTP();
        console.log(otp);
      
        // Updat

      
        
        const updateResult = await Otp.updateOne({ email: globalEmail }, { $set: { otp: otp } });

       
            // Send the new OTP to the user
            sendOTPByEmail(globalEmail, otp);
        
    
        // Render the OTP entry page
        res.render('otp', { message: 'OTP resent successfully' });
    } catch (error) {
        next(error);
        res.render('otp', { message: 'An error occurred during OTP resend' });
    }
};
const verifyLogin = async(req,res,next)=>{

    try {

 
        
    
        const email = req.body.email;
        const password = req.body.password;
    
        console.log(email);
        console.log(password);
    
       const userData = await User.findOne({email:email});
       console.log(userData);
     
       console.log("session on the time of login",req.session)
       
    
       if(userData){
    
      const passwordHash = await bcrypt.compare(password,userData.password);
      console.log(passwordHash)
         if(passwordHash){
            
            req.session.user = userData; 
            console.log(" req.session.user", req.session.user);
            const timestamp = Date.now();
            res.redirect('/');
          } else{
          
            res.render('login',{message:"email and password"})
         }
    
       }
       else{
        res.render('login',{message:"email and password are invalid"})
       }
        
    } catch (error) {
        next(error)   ;                                            
    }
    
    }

    const logout = async(req,res,next) => {
       try{ 
        console.log("here");
        
        delete req.session.user;
        
        res.redirect('/login');
        
       }catch (error) {
         next(error);
       }
       }

       //load product page//
       let lowPrice ;
    
const loadProDetails = async(req,res,next) => {
    try{

        const productId = new mongoose.Types.ObjectId(req.query.productId);

        console.log("productId",productId);

        
      
       
        const Product = await product.aggregate([
            {
                $match: { _id: productId}
            },
            {
                $lookup: {
                    from: "productoffers", 
                    localField: "productOffer",
                    foreignField: "_id",
                    as: "proOffer"
                }
            },
            {
                '$lookup': {
                  'from': 'categories', 
                  'localField': 'category', 
                  'foreignField': '_id', 
                  'as': 'catData'
                }
              }, {
                '$unwind': {
                  'path': '$catData'
                }
              }, {
                '$match': {
                  'catData.is_list': 1
                }
              },
              {
                '$lookup': {
                  'from': 'categoryoffers', 
                  'localField': 'categoryOffer', 
                  'foreignField': '_id', 
                  'as': 'catOffer'
                }
              }
        ])
       
       
        console.log("proData",Product);
        console.log("Product[0].proOffer[0]?.productOfferAmt",Product[0].proOffer[0]?.productOfferAmt);
        console.log("Product[0].catOffer[0]?.categoryofferAmt",Product[0].catOffer[0]?.categoryofferAmt);
        let isInWishlist = false;

if (req.session.user && req.session.user._id) {
    const userWishlist = await Wishlist.findOne({
        user: req.session.user._id,
        wishlistItems: { 
            $elemMatch: { productId: productId } 
        }
    });
    console.log("userWishlist", userWishlist);
    isInWishlist = !!userWishlist;
} else {
    isInWishlist = false; 
}

        res.render('proDetails', {user:req.session.user, product: Product ,productId:productId,proffer:Product[0].proOffer[0]?.productOfferAmt,catoffer:Product[0].catOffer[0]?.categoryofferAmt,isInWishlist});

    }catch (error) {
        next(error);
    }
}   
      //Acount Details//

    const loadAccountDetails = async(req,res,next) => {
        try{

            const user = req.session.user;

            console.log("userxsxsa",user);
            const userId = user._id;
            console.log("userId",userId);
            const userData = await User.findById(userId)
           
           
           

            res.render('accountDetails',{user:userData});
        }catch (error) {
            next(error);
        }
    }

    const loadEditAccountDetails = async(req,res,next) => {
        try{
            const userId = req.query.user;
            console.log("userIdhghg",userId);

            const user = await User.findById(userId);
            console.log('user',user);

            res.render('editAccountDetails',{user:user});

        }catch (error) {
            next(error);
        }
    }

    const updateAccountDetails = async (req,res,next) => {
        try{

            const user = req.params.userId;
            console.log("userdfbdfb",user);
            const userData = await User.findById(user);

            const userName = req.body.name.trim();
            if (!userName) {
                return res.render('editAccountDetails', { message: 'user name is required',
                user:userData});
            }
    
            
    
            // Validate if description is provided and does not contain only spaces
            const userMobile = req.body.mobile.trim();
            if (!userMobile) {
                return res.render('editAccountDetails', { message: 'mobile is required',
                user:userData });
            }

            if (!/^\d{10}$/.test(userMobile)) {
                return res.render('editAccountDetails', { message: 'Mobile number must be exactly 10 digits' ,
                user:userData });
            }
    
            // Validate if stock is a valid number
            
            if (!/^\d+$/.test(userMobile)) {
                return res.render('editAccountDetails', { message: 'mobile should be a number',
                user:userData });
            }
            if (/^0+$/.test(userMobile)) {
                return res.render('editAccountDetails', { 
                    message: ' Invalid mobile number',
                    user: userData 
                });
            }
    
            const existingUser = await User.findById(user);

    
            existingUser.name = req.body.name;
           ;
            existingUser.mobile = req.body.mobile;
            

            const updatedUser = await existingUser.save();

            console.log("updatedUser",updatedUser);

            if(updatedUser) {
                res.redirect('/accountDetails')
            }else {
                res.render('editAccountDetails')
            }
           
            

        }catch (error) {
            next(error);
        }
    }
    const loadChangePassword = async(req,res,next) => {
        try{
            res.render('changePassword',{user:req.session.user});


        }catch (error) {
            next(error);34732
        }
    }

    const changePassword = async(req,res,next) => {
        try{


            const userId = req.session.user;
            console.log("userId",userId);
            const currentPassword = req.body.current;
            console.log("currentPassword",currentPassword);

            if(userId) {
                const passwordHash = await bcrypt.compare(currentPassword,userId.password);
                console.log(passwordHash);
          
            if(passwordHash === false ){
                return res.render('changePassword',{message:"invalid password"});
           
            }

            const newPassword = req.body.new;
            const confirmPassword = req.body.confirm;
            console.log("confirmPassword",confirmPassword);

            
                // Proceed with password change
                // Update the user's password in the database
                // Here's a hypothetical example using Mongoose
                console.log("userId.password",userId.password);
                const hashedPassword = await bcrypt.hash(confirmPassword, 10);
                await User.updateOne({ _id: userId }, { password: hashedPassword });
             console.log("userId.password",userId.password);
                // Render a success message or redirect the user to a success page
                res.render('changePassword', { message: "Password changed successfully" ,user:req.session.user});
            }
            
        





        }catch (error) {
            next(error);
        }
    }
                //chekoutpage//

    const loadCheckoutPage = async(req,res,next) => {
        try{
            delete req.session.coupon
  console.log("heyjsudhssd",req.session.coupon)

            console.log('hii,its here')
            const userId = req.session.user._id;
            console.log('userID',userId);
            const userWallet = await Wallet.findOne({user:userId});
            console.log(userWallet);
            

            const address = await Address.find({user:req.session.user});
            console.log("addredd",address);
           
            
            let userCart = await Cart.aggregate([
                { $match:{user: new mongoose.Types. ObjectId( userId)} },
                {
                    $lookup:{
                        from:'products',
                        localField:'cartItems.productId',
                        foreignField:'_id',
                        as:'cartItemsDetails'
                    }
                },
                {
                    $project: {
                        cartItemsDetails: {
                            _id: 1,  // Include other fields you may want
                           
                            price:1,
                           
                            pname:1,
                            
                           
                          
                          
                            
                            // Include the quantity field from cartItems
                        },
                        // Include other fields from userCart if needed
                    }
                }
            ]);

            const coupon = await Coupon.find()
          console.log("is coupon session here??",req.session.coupon);

            let useritems = await Cart.findOne({ user: req.session.user._id });
            console.log("useritems",useritems)
            req.session.total = useritems.subtotal;
        
            res.render('checkout',{addata:address,products: userCart[0].cartItemsDetails,userItems:useritems.cartItems,subtotal:useritems.subtotal,user:req.session.user,coup:coupon,wallet:userWallet});

        }catch (error) {
            next(error)
        }
    }

    
    const createRazorpayOrder = async (req, res) => {
        try {
            const totalAmount = req.session.total;
            const orderId = req.query.orderId;
            console.log("orderId",orderId);
            console.log("coming to razorpay??");
            const data = req.params.formData;
            console.log("data",data)
            const options = {
                amount:totalAmount*100 ,
                currency: "INR",
                receipt: "fndjbgfj",
              };
  
              const order = await instance.orders.create(options);
          
            console.log("coming heree too33?");
            console.log(order);
            req.session.statusChange = 'razarpay';
         
    
            res.status(200).json({
                success: true,
                message: 'Order created successfully',
                order: order,
                key_id:process.env.RAZORPAY_ID_KEY
            });
        } catch (error) {
            console.error("Error creating Razorpay order:", error);
            res.status(500).json({
                success: false,
                message: 'Failed to create order'
            });
        }
    };
    


    const verifyCoupon = async(req,res,next) => {
        try {
            console.log("still coming?????")
            const cart = await Cart.findOne({user:req.session.user});
            const coupon = await Coupon.findOne({code: req.body.code})
           if(!coupon){
            return res.status(401).json({
                err:true,
                message:'Invalid coupon code'
            })
           }

           if(new Date() > coupon.endDate){
            return res.status(401).json({
                err:true,
                message:'coupon expired'
            })
           }

           if(cart.subtotal < coupon.maxAmt){
            return res.status(401).json({
                err:true,
                message:`Coupon is valid only for amout above ${coupon.maxAmt}`
            });
           }

           req.session.coupon = req.body.code;

           const amtAfterDis = cart.subtotal - coupon.couponAmt;

           res.status(200).json({status:true,total:amtAfterDis,couponDisAmt: coupon.couponAmt});



        }catch(error) {
            next(error);
        }
    }

    const removeCoupon = async(req,res,next) => {
        try{
            delete req.session.coupon;
            const cart = await Cart.findOne({user:req.session.user});

            res.status(200).json({
                status: true,
                total:cart.subtotal,
                couponDisAmt: 0
            });


        }catch(error){
            next(error);
        }
    }
   
const loadUserWallet = async(req,res,next) => {
    try{
        const user = req.session.user._id;
         console.log("user",user);
         const userId = new mongoose.Types.ObjectId(user)
         const wallet = await Wallet.findOne({user:userId});
         console.log("wallet",wallet);

        res.render('wallet',{wallet:wallet,user:user});

    }catch (error) {
        next(error)
    }
}
   const loadAddFund = async(req,res,next) => {
    try{
        const user = req.session.user._id;
        console.log("user",user);
        const userId = new mongoose.Types.ObjectId(user)
        const wallet = await Wallet.findOne({user:userId});
        console.log("wallet",wallet);

        res.render('addFund',{wallet:wallet,user:user});

    }catch (error) {
        next(error)
    }
   }

   const walletRazorPay = async(req,res) => {
    try{
        const amount = req.body.amount;
        console.log("amount",amount);
        console.log("coming to razorpay??");
        
        const options = {
            amount:amount*100 ,
            currency: "INR",
            receipt: "fndjbgfj",
          };

          const order = await instance.orders.create(options);
      
        console.log("coming heree too33uhhh?");
        console.log(order);

        res.status(200).json({
            success: true,
            message: 'Order created successfully',
            order: order,
            key_id:process.env.RAZORPAY_ID_KEY
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order'
        });
    }
    }


    const addFund = async(req,res,next) => {
        try{

         const amount = req.body.amount;
         console.log("amount",amount);
         const user = req.session.user._id;
         console.log("user",user);
         const userId = new mongoose.Types.ObjectId(user)
         const wallet = await Wallet.findOne({user:userId});
         console.log("wallet",wallet);
         wallet.balance += parseInt(amount);

         console.log(" Wallet.balance", wallet.balance)
         const newTransaction = {
             amount:amount,
             status: 'credited',
             createdAt:Date.now()
 
         };
         wallet.trancsaction.push(newTransaction);
           
         // Push the new transaction object to the transactions array
         
         await wallet.save();

        }catch(error) {
            next(error)
        }
    }

   
   
    const laodRefferalOffer = async(req,res,next) => {
        try{
            const userreff = await User.findOne({_id:req.session.user._id}) 
            res.render('refferalOffer',{reff:userreff.refferalOffer,user:req.session.user._id})

        }catch(error) {
            next(error)
        }
    }

    const loadShop = async(req,res,next) => {
        try{
            const catData = await category.find({is_list:1})
              
            const proData = await product.aggregate([
                {
                    $match: { is_list: 1 }
                },
                {
                    $lookup: {
                        from: "productoffers", 
                        localField: "productOffer",
                        foreignField: "_id",
                        as: "proOffer"
                    }
                },
                {
                    '$lookup': {
                      'from': 'categories', 
                      'localField': 'category', 
                      'foreignField': '_id', 
                      'as': 'catData'
                    }
                  }, {
                    '$unwind': {
                      'path': '$catData'
                    }
                  }, {
                    '$match': {
                      'catData.is_list': 1
                    }
                  },
                  {
                    '$lookup': {
                      'from': 'categoryoffers', 
                      'localField': 'categoryOffer', 
                      'foreignField': '_id', 
                      'as': 'catOffer'
                    }
                  }
            ])
            const filteredProData = proData.filter(product => product.category !== null);
        // console.log("filteredProData",filteredProData);
        filteredProData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            res.render('shop',{user:req.session.user, category:catData,proffer:proData[0]?.proOffer[0],catoffer:proData[0]?.catOffer[0],product:filteredProData});

        }catch(error) {
            next(error);
        }
    }

    const filterProduct = async (req, res, next) => {
        try {
            console.log("RAW QUERY:", req.query);
    
            // CATEGORY
            let categoryIds = [];
            if (req.query.category) {
                if (Array.isArray(req.query.category)) {
                    categoryIds = req.query.category.map(id => new mongoose.Types.ObjectId(id));
                } else {
                    categoryIds = [new mongoose.Types.ObjectId(req.query.category)];
                }
            }
    
            // PRICE
            const [min, max] = req.query.price.split("-").map(v => Number(v.trim().substring(1)));
    
            // ⭐ BUILD MATCH
            let matchStage = {
                is_list: 1,
                price: { $gte: min, $lte: max }
            };
    
            // ADD CATEGORY FILTER
            if (categoryIds.length > 0) {
                matchStage.category = { $in: categoryIds };
            }
    
            // ADD SEARCH FILTER
            if (req.query.search && req.query.search.trim() !== "") {
                matchStage.pname = {
                    $regex: req.query.search.trim(),
                    $options: "i"
                };
            }
    
            // SORT
            let sortObject = {};
            if (req.query.sort === "1") sortObject = { price: 1 };
            if (req.query.sort === "-1") sortObject = { price: -1 };
    
            // ⭐ FINAL PIPELINE
            const filteredProducts = await product.aggregate([
                { $match: matchStage },
                { $sort: sortObject },
                {
                    $lookup: {
                        from: "productoffers",
                        localField: "productOffer",
                        foreignField: "_id",
                        as: "proOffer"
                    }
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "catData"
                    }
                },
                { $unwind: "$catData" },
                { $match: { "catData.is_list": 1 } },
                {
                    $lookup: {
                        from: "categoryoffers",
                        localField: "categoryOffer",
                        foreignField: "_id",
                        as: "catOffer"
                    }
                }
            ]);
    
            return res.status(200).json({
                success: true,
                filteredProducts,
                proffer: filteredProducts[0]?.proOffer[0],
                catoffer: filteredProducts[0]?.catOffer[0]
            });
    
        } catch (error) {
            next(error);
        }
    };
    


    const loadForgotPassword = async(req,res,next) => {
        try{

            res.render('resetPasswordEmail');

        }catch (error) {
            next(error);
        }
    }
    
    const validateresetEmail = async(req,res,next) => {
        try{
console.log("hii")
                const email = req.body.email;
                console.log("email",email);
               

                const user = await User.findOne({email:email});
                console.log("user",user);
                if(!user) {
                    console.log("hii")
                   res.render('resetPasswordEmail',{message:'Invalid email address'})
                        
                    }

                    otp = generateOTP();
         console.log(otp);
         sendOTPByEmail(req.body.email, otp);
         req.session.forgot = user;
         console.log("req.session.forgot",req.session.forgot)

                    res.render('resetOtp',{resset:req.session.forgot})
                
                

        }catch (error) {
            next(error);
        }
    }
   const resetOTP = async(req,res,next) => {
    try{
console.log("hii,in here i am waiting")
console.log(req.session.forgot)
        if(req.session.forgot) {
            const userOtp = req.body.otp;
            if(userOtp === otp){
                return res.render('resetPassword',{pass:req.session.forgot})
            }else{
                return res.render('resetOtp', { message: 'Invalid OTP' })
            }
            
        }

    }catch (error) {
        next(error);
    }
   }

    const ressetPasssword = async(req,res,next) => {
        try{
            console.log("hiiiiii")
            const userId = req.session.forgot._id;
            console.log("userId",userId);
            const confirmPassword = req.body.confirm;
            console.log("confirmPassword",confirmPassword);
            const hashedPassword = await bcrypt.hash(confirmPassword, 10);
            console.log("hashedPassword",hashedPassword);

            await User.updateOne({ _id: userId }, { password: hashedPassword });
         console.log("userId.password",userId.password);
         res.redirect('/login');

        }catch (error) {
            next(error);
        }
    }


 

module.exports = {
    loadHome,
    loadLogin,
    loadRegister,
    insertUser,
     validateOTPAndInsertUser,
     resendOTP,
     verifyLogin,
     logout,
     loadProDetails,
     loadAccountDetails,
     loadChangePassword,
     changePassword,
     loadCheckoutPage,
     createRazorpayOrder,
     loadEditAccountDetails,
     updateAccountDetails,
     verifyCoupon,
     removeCoupon,
     loadUserWallet,
     loadAddFund,
     walletRazorPay,
     addFund,
     
     laodRefferalOffer,
     loadShop,
     filterProduct,
     loadForgotPassword,
     validateresetEmail,
     ressetPasssword,
     resetOTP,
     
   
}