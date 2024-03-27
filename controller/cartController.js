
const product = require('../model/productModel');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Cart = require('../model/cartModel');
const Wishlist = require('../model/whishlistModel')



 const loadCart = async(req,res) => {
    try{

      delete req.session.coupon;
      console.log("hjsojbdjspa",req.session.coupon)
        const userId = req.session.user._id;
console.log("kdskdns",userId);


        // Find the user's cart or create a new one if it doesn't exist
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
                  subtotal:1,
                    cartItemsDetails: {
                        _id: 1,  // Include other fields you may want
                        quantity: 1,
                        price:1,
                        pimg:1,
                        color:1,
                        pname:1,
                       stock:1,
                       categoryOffer:1,
                       productOffer:1
                      
                      
                      
                        
                        // Include the quantity field from cartItems
                    },
                    // Include other fields from userCart if needed
                }
            },
           
        ]);
       
        console.log("userCart",userCart)
        if (userCart.length === 0) {
          // Return early if userCart is empty
          return res.render('cart', { user: req.session.user,products:userCart})
      }
        
        
        if (!userCart || userCart.length === 0 || (userCart.length > 0 && userCart[0].cartItemsDetails.length === 0)) {
          // Handle the case when the cart is empty
          return res.render('cart', { user: req.session.user, products: [],subtotal:userCart[0].subtotal});
      }
      
        let useritems = await Cart.aggregate([
          { $match:{user: new mongoose.Types. ObjectId(req.session.user._id)}
         }, {
          '$unwind': {
            'path': '$cartItems'
          }
        },
         {
          '$lookup': {    
            'from': 'products', 
            'localField': 'cartItems.productId', 
            'foreignField': '_id', 
            'as': 'product'
          }
        }, 
        {
          '$lookup': {
            'from': 'categoryoffers', 
            'localField': 'product.categoryOffer', 
            'foreignField': '_id', 
            'as': 'catoffer'
          }
        }, {
          '$lookup': {
            'from': 'productoffers', 
            'localField': 'product.productOffer', 
            'foreignField': '_id', 
            'as': 'proffer'
          }
        }
        ])
               console.log("useritems.cartItems",useritems);
        
        

            
   

        if (!userCart) {
          userCart = new Cart({ user: userId, cartItems: [] });
        }
    console.log("useritems.proffer",useritems[0].subtotal)

        // const cartItems = await Cart.findOne({userId});
        // console.log("cartItems",cartItems)

    
        // const productsInCart = await product.find({ _id: { $in: userCart.cartItems.map(item => item.productId) } });
        // console.log(productsInCart);
    // Check if userCart is not an empty array
    
        res.render('cart', { user: req.session.user, products: userCart[0].cartItemsDetails,userItems:useritems ,subtotal:useritems[0].subtotal,proffer:useritems[0]?.proffer,catoffer:useritems[0]?.catoffer});
   
    }catch (error) {
        console.log(error.message);
    }
  }

  const addProductToCart = async(req,res) => {
   

        try {
            // Assuming productId is sent in the request body
            console.log("hiii")
            let lowPrice = 0;
            
            const productId = req.body.productId;
            console.log("which are you",productId);
        
            // Check if the user is authenticated
            if (!req.session.user) {
              return res.redirect('/login'); // or handle the lack of authentication appropriately
            }
        
            const userId = req.session.user._id;
        
            const products = await product.aggregate([
              { $match:{_id: new mongoose.Types. ObjectId(req.body.productId)}
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
                    'from': 'categoryoffers', 
                    'localField': 'categoryOffer', 
                    'foreignField': '_id', 
                    'as': 'catOffer'
                  }
                }
          ])
          let actualPrice = 0

           console.log( 'products345',products);
           const proffer = products[0].proOffer[0]?.productOfferAmt;
           const catoffer = products[0].catOffer[0]?.categoryofferAmt

           if(!proffer && !catoffer) { 
              actualPrice = products[0].price;
              } else if(proffer || catoffer){ 
                

                   const price = parseFloat(products[0].price); 
                   const productOffer = products[0].proOffer[0]?.productOfferAmt || 0; 
                   const categoryOffer = products[0].catOffer[0]?.categoryofferAmt || 0;
                   const highestOffer = Math.max(productOffer, categoryOffer);
                  

                   const discountedPrice = price * (100 - highestOffer) / 100;
                    actualPrice = discountedPrice.toFixed(0)

                 
               
                }
                console.log("actualPrice",actualPrice);
           
           
            // Update the cart: add the product if it's not already in the cart
            const result = await Cart.findOneAndUpdate(
                { user: userId, 'cartItems.productId': { $ne: productId } }, // Check if the product is not in the cart
                {
                  $push: {
                    cartItems: {
                      productId,
                      quantity: 1, // Set the initial quantity
                      price: actualPrice,
                      totalPrice: actualPrice,
                     
                    },
                  }, // Update the subtotal
                },
                
                { new: true ,upsert:true} // Return the updated document and create the document if it doesn't exist
              );
              
            console.log("result",result);
if (!result) {
    // If result is null, redirect to cart
    return res.redirect('/cart');
}
            const subtotal = result.cartItems.reduce((acc, item) => acc + parseFloat(item.totalPrice), 0).toFixed(2);
            
    // Update the subtotal in the document
    result.subtotal = subtotal;


    // Save the updated document
    await result.save();
    console.log("result",result);
        res.redirect('/cart');

    }catch (error) {
        console.log(error.message);
    }
  }

         const updateQuantity = async(req,res) => {
            try{
                console.log("hii its here")

                
                const productId = req.body.productId;
                console.log("productId",productId);
                const convertedProductId = new mongoose.Types. ObjectId(productId);
                console.log("productId",convertedProductId);
                const actionType = req.body.actionType;
                console.log("productId",productId);
                console.log("actionType",actionType);


                // Find the user's cart or create a new one if it doesn't exist
                let userCart = await Cart.findOne({ user: req.session.user._id });
                console.log("user: req.session.user._id", req.session.user._id)
            
                if (!userCart) {
                  userCart = new Cart({ user: req.session.user._id, cartItems: [] });
                }
            
                // Find the index of the item in cartItems array with the matching productId
                const index = userCart.cartItems.findIndex(item => item.productId.equals(productId));
                console.log("index",index);
            
                if (index !== -1) {
                    console.log("hiii,it here")

                    const Product = await product.findById(productId);
                    console.log("productId",productId);
                    console.log("stock",Product.stock);
                    const totalStock = Product.stock

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    console.log("Cart item quantity:", userCart.cartItems[index].quantity);
    // Check if the actionType is 'add' and the updated quantity exceeds the available stock
    if ( ((userCart.cartItems[index].quantity+1 ) > Product.stock && actionType === 'add')) {
        console.log("hi,in here");
        
      
        return res.json({
            err: true,
        });
        // Render the cart view with the error message
      
    }

                  // Update the quantity based on the actionType
                  if (actionType === 'add') {
                    userCart.cartItems[index].quantity += 1;
                  } else if (actionType === 'subtract') {
                    userCart.cartItems[index].quantity -= 1;
                    if (userCart.cartItems[index].quantity < 1) {
                      // Ensure the quantity does not go below 1
                      userCart.cartItems[index].quantity = 1;
                    }
                  }

                  
                  
                 // Update the total price based on the new quantity
                 userCart.cartItems[index].totalPrice =
                 userCart.cartItems[index].quantity * userCart.cartItems[index].price;

                 console.log('Updated Cart:', userCart);
                 const subtotal = userCart.cartItems.reduce((acc, item) => acc + parseFloat(item.totalPrice), 0).toFixed(2);
                 console.log("subtotal",subtotal);

// Update the subtotal in the document
              userCart.subtotal = subtotal;
              
// Save the updated document
 
             // Save the updated cart
        await userCart.save();

        

                
        if((userCart.cartItems[index].quantity ) > Product.stock && actionType === 'subtract'){
            return res.json({
                err: true,
                subtotal
            });
          }
            
                  // Redirect the user to the cart page after updating the quantity
                  res.json({productId, updatedQuantity: userCart.cartItems[index].quantity ,subtotal});
                } else {
                  res.status(404).json({ error: 'Product not found in the cart' });
                }
              } catch (error) {
                console.error('Error updating quantity:', error);
                res.status(500).json({ error: 'Internal Server Error' });
              }
            };

            const removeProductFromCart = async (req, res) => {
                try {
              
                  const userId = req.session.user._id;
                  console.log("hiiiiiiiii");
                  const productIdToRemove = req.params.productId;
                  console.log("productIdToRemove", productIdToRemove);
              
                  // Retrieve the user's cart
                  let userCart = await Cart.findOne({ user: userId });
                  console.log("userCartdsdfdsfd", userCart);
              
                  if (!userCart) {
                    return res.status(404).send('Cart not found');
                  }
              
                  console.log("hello its here");
              
                  // Remove the product from the cart array
                //   userCart.cartItems = userCart.cartItems.filter((item) => item.productId.toString() !== productIdToRemove);
              
                  // Find the index of the item in cartItems array with the matching productId
                  index = userCart.cartItems.findIndex(item => item.productId.equals(productIdToRemove));
              console.log("index",index)
                  if (index !== -1) {
                    // Calculate the total price of the removed item
                    const removedItemTotalPrice = userCart.cartItems[index].totalPrice;
              
                    // Remove the item from cartItems array
                    userCart.cartItems.splice(index, 1);
              
                    const newSubtotal = (parseFloat(userCart.subtotal) - parseFloat(removedItemTotalPrice)).toFixed(2);
              
                    console.log("newSubtotal", newSubtotal);
                    userCart.subtotal = newSubtotal;
              
                    // Update the subtotal in the document
                    // userCart.subtotal = newSubtotal;
              
                    // Save the updated document
                    await userCart.save();
              
                    res.redirect('/cart');
                  }
                } catch (error) {
                  console.log(error.message);
                  res.status(500).send('Internal Server Error');
                }
              };

              const loadWishlist = async(req,res,next) => {
                try {
            
                    const wishlist = await Wishlist.aggregate([
                        {$match:{user:new mongoose.Types.ObjectId(req.session.user._id)}},
                        {'$unwind' : {
                            'path' : '$wishlistItems'
                        }
                    },
                    {
                        '$lookup': {    
                            'from': 'products', 
                            'localField': 'wishlistItems.productId', 
                            'foreignField': '_id', 
                            'as': 'product'
                          } 
                    },
                    {
                        '$lookup': {
                          'from': 'categoryoffers', 
                          'localField': 'product.categoryOffer', 
                          'foreignField': '_id', 
                          'as': 'catoffer'
                        }
                      }, {
                        '$lookup': {
                          'from': 'productoffers', 
                          'localField': 'product.productOffer', 
                          'foreignField': '_id', 
                          'as': 'proffer'
                        }
                      }
                    ]);
                    if (!wishlist || wishlist.length === 0) {
                      // Render the page with an empty wishlist
                      return res.render('wishlist', {user:req.session.user._id, wishlist: [],product:wishlist });
                  }
                    console.log("kkk",wishlist  );
            
                    console.log("wishlistItems",wishlist[0].wishlistItems);
                  
            
                    res.render('wishlist',{user:req.session.user,proffer:wishlist[0]?.proffer,catoffer:wishlist[0]?.catoffer,product:wishlist,wishlist:wishlist});
            
                }catch (error) {
                    next(error)
                }
               }
            
               const addToWishlist = async(req,res,next) => {
                try{
                    console.log("kkkkkk");
                    const productId = req.body.productId;
                    
                    
                    if( !req.session.user) {
                        return res.redirect('/login');
                    }
                    const userId = req.session.user._id
                    const result = await Wishlist.findOneAndUpdate(
                        { user: userId, 'wishlistItems.productId': { $ne: productId } }, // Check if the product is not in the cart
                        {
                            $push: {
                                wishlistItems: { productId },
                            }, // Update the subtotal
                        },
                        { new: true, upsert: true } // Return the updated document and create the document if it doesn't exist
                    );
                    res.redirect('/wishlist');
            
                }catch (error) {
                    next(error);
                }
               }

               const removeWishlist = async(req,res,next) => {
                try{

                  const productId = req.query.id;
                  const userId = req.session.user._id
                  let wishlist = await Wishlist.findOne({ user: userId });

                  index = wishlist.wishlistItems.findIndex(item => item.productId.equals(productId));
                  console.log("index",index)
                      if (index !== -1) {
                        wishlist.wishlistItems.splice(index, 1);
                      }
                      await wishlist.save();

                       res.status(200).json({message:true,deletedProductId:productId});

                }catch (error) {
                  next(error);
                }
               }
            
            
  module.exports = {
    loadCart,
    removeProductFromCart,
    addProductToCart,
     updateQuantity,
     loadWishlist,
     addToWishlist,
     removeWishlist
  }