
const product = require('../model/productModel');
const Address = require('../model/userAddressModel');
const Order = require('../model/orderModel');
const Coupon = require('../model/couponModel');
const wallet = require('../model/userWalletModel');
const mongoose = require('mongoose');
const Cart = require('../model/cartModel');
const User = require('../model/userModel')
const puppeteer = require('puppeteer-core')
const fs = require('fs');
const path = require('path');
const ejs  = require('ejs')
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY ,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});



const orderPlaced = async(req,res) => {
    try{
        
        console.log("req.session",req.session.coupon);
        console.log("hi it here");
        console.log(req.params.orderId);
        let products = await Cart.findOne({ user: req.session.user._id });
        console.log("products",products);
        
        // const addata = req.bodyc
     

       const addataId =  req.body.selectedAddress;
       const user = req.session.user._id;
     console.log("userid",user)
       const orderedProducts = [];

       const pM = req.body.paymentMethod;
       // Loop through each product in the cart
       for (const cartItems of products.cartItems) { 
        const productDetails = await product.findById(cartItems.productId);
        console.log("coming till here?")
      

        
     if (pM === 'razorpay'){
        if (productDetails) {
            const {  pname,stock } = productDetails;
            const { quantity, price,totalPrice} = cartItems;

            // Add the product details to the orderedProducts array
            orderedProducts.push({
                productId: cartItems.productId, 
               name: pname,
                quantity,
                price,
                totalPrice,
                status:'Order Placed'
                
               
            });
            const newStock = stock - quantity;
            await product.findByIdAndUpdate(cartItems.productId, { stock: newStock });
           
        }
    }else{
        if (productDetails) {
            const {  pname,stock } = productDetails;
            const { quantity, price,totalPrice} = cartItems;

            // Add the product details to the orderedProducts array
            orderedProducts.push({
                productId: cartItems.productId, 
               name: pname,
                quantity,
                price,
                totalPrice
               
                
               
            });
            const newStock = stock - quantity;
            await product.findByIdAndUpdate(cartItems.productId, { stock: newStock });
          
        }
    }
}
console.log("orderedProducts",orderedProducts);
console.log("addataId",addataId);
        const addressDetails = await Address.findById(addataId);
        console.log("addressDetails",addressDetails);
        const paymentMethod = req.body.paymentMethod;
        console.log("paymentMethod",paymentMethod);
       
        const coupon = await Coupon.findOne({code:req.session.coupon})

        if(req.session.coupon){
            products.subtotal =  products.subtotal-coupon.couponAmt;
        }
        console.log("products.subtotal",products.subtotal);
        const userWallet = await wallet.findOne({user:req.session.user._id});
        if(paymentMethod === 'wallet'){
            
            userWallet.balance -= parseInt(products.subtotal);

        console.log(" Wallet.balance", userWallet.balance)
        const newTransaction = {
            amount:products.subtotal,
            status: 'debited',
            createdAt:Date.now()

        };
        userWallet.trancsaction.push(newTransaction);
    }
    await userWallet.save(); 

    
    
        

       const newOrder =  new Order({
        user :user,

        address: {
            name: addressDetails.name,
            mobile: addressDetails.mobile,
            pincode: addressDetails.pincode,
            address: addressDetails.address,
            city: addressDetails.city,
            // Add any other fields as needed
        },
        product: orderedProducts,
        subtotal: products.subtotal ,
        paymentMethod:paymentMethod // name :  userCart.cartItemsDetails.name,

        // Add any other relevant order details
    });
    if(req.session.coupon){
        console.log("req.session.coupon.couponAmt",req.session.coupon);
        const coupon = await Coupon.findOne({code:req.session.coupon})
        newOrder.coupon = {
            coupAmt: coupon.couponAmt,
            discoutAmt: newOrder.subtotal
        };
    }
        await newOrder.save();
        console.log("kkkkkk");
        await Cart.deleteMany({ user: req.session.user._id });
      console.log("jiiiii")
        // products.subtotal = 0;
        // await products.save();
        console.log("here or not");
        req.session.OrderID = newOrder._id;
        console.log("here ");
   console.log("coming to the last?")
        // Create an array to store address objects
        res.render('orderPlaced',{user:req.session.user});

    }catch (error) {
        console.log(error.message);
    }
}

const loadOrder = async(req,res) => {
    try{

        const user = req.session.user._id;
        // console.log("user",user);

        const order = await Order.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(user) } },
            {
                '$unwind': {
                  'path': '$product'
                }
              }, {
                '$lookup': {
                  'from': 'products', 
                  'localField': 'product.productId', 
                  'foreignField': '_id', 
                  'as': 'result'
                }
              }, 
            { $sort: { date: -1 } }// Deconstruct the product array
        ]);
console.log(order);
        console.log("order",order[0].result);

    
        res.render('Orders', { orders:order ,user:req.session.user,req});
        
  
        

       

    }catch (error) {
        console.log(error.message);
    }
 }     
 
 const orderDetails = async(req,res) => {
    try{
        const orderId = req.params.orderId;
        const productId = req.params.productId;
        console.log("orderIdxsx",orderId);
        console.log("productIdxsx",productId);
        const order = await Order.findById(orderId).populate('user')
        console.log("order",order)
        
        const products = await product.findById(productId);
        const orderPro = order.product.find(pro => String(pro.productId) === productId )

       console.log("products",products);
        res.render('orderDetail',{order:order,user:req.session.user,product:products,pro:orderPro});

    }catch (error) {
        console.log(error.message);
    }
 }

 const loadCancelOrder = async(req,res) => {
    try{
        const orderId = req.params.orderId;
        const productId = req.params.productId;
        console.log("orderndkf",orderId);
        console.log("productnmdjf",productId);
        const order = await Order.findById(orderId)
        
        const products = await product.findById(productId);
        const orderPro = order.product.find(pro => String(pro.productId) === productId );
        console.log("products",products);
        console.log("orderPro",orderPro);
        res.render('cancelOrder',{order:order,user:req.session.user,product:products,pro:orderPro})

    }catch (error){
        console.log(error.message);
    }
  }

  const cancelOrder = async(req,res) => {
    try{
        console.log("heyyy,its here")
        const productId = req.body.productId
        const orderId = req.body.orderId
        console.log("orderIdfdfsd",productId);
        console.log("orderId",orderId);
        const order = await Order.findById(orderId)
        console.log("order",order);
        const orderPro = order.product.find(pro => String(pro.productId) === productId );
        console.log("orderPro",orderPro);
        const newStatus = "cancelled"; 
        orderPro.status = newStatus;
        await order.save();
        const userId = order.user;
        console.log("userId",userId)
        
        const Wallet = await wallet.findOne({ user: userId });
        
          if(order.paymentMethod === "razorpay" || order.paymentMethod === 'wallet') {
            if (Wallet.balance > 0 && Wallet.balance > parseInt(orderPro.totalPrice)) { // Check if the wallet balance is greater than zero
                Wallet.balance -= parseInt(orderPro.totalPrice);
                console.log(" Wallet.balance", Wallet.balance);
                const newTransaction = {
                    amount: orderPro.totalPrice,
                    status: 'debited',
                    createdAt: Date.now()
                };
                Wallet.trancsaction.push(newTransaction);
                await Wallet.save();
            } else {
                console.log("Wallet balance is zero, no deduction made.");
            }
    }
    // await Wallet.save();
        
        console.log("orderPro2",orderPro);
      

        

        for (const orderedProduct of order.product) {
console.log("here");
            const pro = await product.find(orderedProduct.productId);
            console.log(pro);
            console.log('coming?')
            if (pro) {
console.log('here?');
                console.log('products.stock ',pro[0].stock );
                console.log('orderedProduct.quantity',orderedProduct.quantity);
                // Add the quantity back to the product stock
                const currentStock = parseInt(pro[0].stock);
                const newStock = currentStock + orderedProduct.quantity;
                console.log('newStock',newStock);
                await product.findByIdAndUpdate(pro[0]._id, { stock: newStock });
            }
        }
        
        return res.status(200).json({ success: true });
    }catch (error) {
        console.log(error.message);
    }
  }


  const loadOrderPlaced = async(req,res) => {
    try{
        console.log("dnsjknd",req.query.orderId);
        const orderId =  new mongoose.Types.ObjectId(req.session.OrderID);
        const order = await Order.findOne({_id:orderId});
        console.log("orderrrr",order);
        for(let i = 0 ; i < order.product.length ; i++) {
            order.product[i].status = "Order Placed"
            await order.save();
        }
       
        

        res.render('orderPlaced',{user:req.session.user});
    }catch (error) {
        console.log(error);
    }
  }

  const handleReturn = async(req,res) => {
    try{
        console.log("hey it here");
        const orderId = req.params.orderId;
        const productId = req.params.productId
        console.log("orderId",orderId)
        console.log("productId",productId);
        const order = await Order.findById(orderId);
        const orderPro = order.product.find(pro => String(pro.productId) === productId );
        console.log("orderPro",orderPro);
        orderPro.returnStatus = 'return';
        await order.save();

        console.log("order",order);

        res.status(200).json({success:true})
        
    }catch (error){
        console.log(error)
    }
  }

  const downloadInvoice = async(req,res) => {
    const browser = await puppeteer.launch({ 
        headless: "new",
        executablePath: '/snap/bin/chromium'
     });
    try{
        console.log("hiii");
       const order = await Order.findOne({_id:req.params.orderId});
       console.log("order",order.product);
       const Product = await product.findOne({_id:req.params.productId});
       console.log("product",Product)
       const user = await User.findOne({_id:order.user});
       console.log("user",user);
       const data = {
        product : order.product,
        order : order,
        address : order.address,
        user : user
       }
       console.log("hiii")
       console.log("data",data);

       const customTemplate = fs.readFileSync(
        path.join(__dirname, "../views/users/invoice.ejs"),
        "utf-8"
      );
      const renderedTemplate = ejs.render(customTemplate, { data });

      const page = await browser.newPage();

      await page.setContent(renderedTemplate);

      const pdfBuffer = await page.pdf({
        format: "A4",
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

      res.status(200).send(pdfBuffer);

    }catch (error) {
        console.log(error);
    }
  }

  const paymentFailedOrder = async (req, res) => {
    try {
        const user = req.session.user._id;
        const cart = await Cart.findOne({ user });

        if (!cart || cart.cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const orderedProducts = [];

        for (const item of cart.cartItems) {
            const productDetails = await product.findById(item.productId);

            if (productDetails) {
                orderedProducts.push({
                    productId: item.productId,
                    name: productDetails.pname,
                    quantity: item.quantity,
                    price: item.price,
                    totalPrice: item.totalPrice,
                    status: "failed"
                });
            }
        }

        const address = await Address.findById(req.body.selectedAddress);

        const failedOrder = new Order({
            user,
            address: {
                name: address?.name,
                mobile: address?.mobile,
                pincode: address?.pincode,
                address: address?.address,
                city: address?.city,
            },
            product: orderedProducts,
            subtotal: cart.subtotal,
            paymentMethod: "razorpay",
            status: "failed",
        });

        await failedOrder.save();

        return res.status(200).json({ 
            success: true,
            orderId: failedOrder._id 
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false });
    }
};


const getFailedOrder = async (req, res) => {
    try {
        console.log("hehe")
        const orderId = req.params.orderId;
        console.log("hehe1",orderId)

        const order = await Order.findById(orderId);
        console.log("hehe2",order)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (err) {
        console.log("Error in getting failed order:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const  createRetryRazorpayOrder = async (req, res) => {
    try {
        const { amount, failedOrderId } = req.body;

        if (!amount || !failedOrderId) {
            return res.status(400).json({
                success: false,
                message: "Amount or failedOrderId missing"
            });
        }

        // Razorpay requires amount in paise
        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `retry_${failedOrderId}`,
        });
        console.log("ji",razorpayOrder)
        return res.status(200).json({
            success: true,
            key_id: process.env.RAZORPAY_ID_KEY,
            order: razorpayOrder
        });

    } catch (error) {
        console.log("Retry Razorpay Order Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create Razorpay retry order"
        });
    }
};
 
const retryPaymentSuccess = async (req, res) => {
    try {
        const { failedOrderId } = req.body;

        if (!failedOrderId) {
            return res.status(400).json({ success: false, message: "Missing failedOrderId" });
        }

        // Fetch failed order
        const failedOrder = await Order.findById(failedOrderId);

        if (!failedOrder) {
            return res.status(404).json({ success: false, message: "Failed order not found" });
        }

        // CHECK failure correctly based on your schema
        const isFailed = failedOrder.product.every(p => p.status === "failed");

        if (!isFailed) {
            return res.status(400).json({
                success: false,
                message: "Order was not marked as failed"
            });
        }

        const user = failedOrder.user;

        // Create a NEW successful order
        const newOrder = new Order({
            user,
            address: failedOrder.address,
            product: failedOrder.product.map(p => ({
                productId: p.productId,
                name: p.name,
                quantity: p.quantity,
                price: p.price,
                totalPrice: p.totalPrice,
                status: "Order Placed ",
                returnStatus: p.returnStatus || null
            })),
            subtotal: failedOrder.subtotal,
            paymentMethod: "razorpay",
            date: new Date(),
            coupon: failedOrder.coupon
        });

        await newOrder.save();

       
        for (const item of failedOrder.product) {
            await product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }


        await Cart.findOneAndUpdate(
            { user },
            { $set: { cartItems: [], subtotal: 0 } }
        );

        await failedOrder.save();

        return res.json({
            success: true,
            newOrderId: newOrder._id,
            message: "Retry payment succeeded",
        });

    } catch (error) {
        console.log("RetryPaymentSuccess ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const retryPaymentFailed = async (req, res) => {
    try {
        const { failedOrderId } = req.body;

        if (!failedOrderId) {
            return res.status(400).json({ success: false, message: "Missing failedOrderId" });
        }

        // Fetch failed order
        const failedOrder = await Order.findById(failedOrderId);

        if (!failedOrder) {
            return res.status(404).json({ success: false, message: "Failed order not found" });
        }

        // CHECK failure correctly based on your schema
        const isFailed = failedOrder.product.every(p => p.status === "failed");

        if (!isFailed) {
            return res.status(400).json({
                success: false,
                message: "Order was not marked as failed"
            });
        }

        const user = failedOrder.user;

        // Create a NEW successful order
        const newOrder = new Order({
            user,
            address: failedOrder.address,
            product: failedOrder.product.map(p => ({
                productId: p.productId,
                name: p.name,
                quantity: p.quantity,
                price: p.price,
                totalPrice: p.totalPrice,
                status: "failed",
                returnStatus: p.returnStatus || null
            })),
            subtotal: failedOrder.subtotal,
            paymentMethod: "razorpay",
            date: new Date(),
            coupon: failedOrder.coupon
        });

        await newOrder.save();


        await failedOrder.save();

        return res.json({
            success: true,
            orderId: newOrder._id,
            message: "Retry payment failed",
        });

    } catch (error) {
        console.log("RetryPaymentSuccess ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


module.exports = {
    orderPlaced,
     loadOrder,
     orderDetails,
     loadCancelOrder,
     cancelOrder,
     loadOrderPlaced,
     handleReturn,
     downloadInvoice,
     paymentFailedOrder,
     getFailedOrder,
     createRetryRazorpayOrder,
     retryPaymentSuccess,
     retryPaymentFailed
}
