const Admin = require("../model/adminModel");
const User = require("../model/userModel");
const Order = require("../model/orderModel");
const Coupon = require("../model/couponModel");
const wallet  = require("../model/userWalletModel");
const refferal = require("../model/refferalOffer")
const admin = require('../model/adminModel');
const product = require('../model/productModel');
const cat = require('../model/categoryModel')
const bcrypt = require('bcrypt');
const puppeteer = require("puppeteer-core")
const ejs = require('ejs')
const fs = require('fs');
const path = require('path');
const { nextTick } = require("process");
const { default: mongoose } = require("mongoose");
const { application } = require("express");




const createAdmin = async(req,res) => {
   

   const Admin = new admin({
        email : req.body.email,
        password :req.body.password
    })
    await Admin.save();
    res.json()
}


const loadAdminLogin = async(req,res) => {
try{
    res.render('login');

}catch (error) {
    console.log(error.message);
}
}

const verifyAdminLogin = async(req,res) => {
    try{
        
       const email = req.body.email;
       const password = req.body.password;

    const adminData = await Admin.findOne({email:email});
    console.log("is this it?",adminData);

    req.session.admin = adminData;

    if(adminData) {
        
        if(password === adminData.password){
            console.log("true")
            
           
            console.log("here")
            res.redirect('dashboard');
        }else{
            res.render('login',{message:"email and password is invalid"})
        }
    }
    else{
        res.render('login',{message:"email and password are invalid"})
       }
    }catch (error) {
        console.log(error.message)                                                
    }
}
  
const loadDashboard = async(req,res) => {
  try{
   console.log("hiii")

   const procount = await product.aggregate([
    {
        $count:"totalProducts"
    }
 ] )
console.log("procount",procount);
const ordercount = await Order.aggregate([
    {
        $count: 'totalOrders'
    }
])
console.log("ordercount",ordercount);
    const usercount = await User.aggregate([
        {
            $count:"totalUsers"
        }
    ])
    console.log("totalUsers",usercount)

    const catcount = await cat.aggregate([
        {
            $count:"totalcats"
        }
    ]);
    console.log("catcount",catcount)

   const currentDate = new Date();

   // Calculate the date 30 days ago
   const thirtyDaysAgo = new Date();
   thirtyDaysAgo.setDate(currentDate.getDate() - 30);

   // Aggregate orders within the last 30 days
   const dailyOrder = await Order.aggregate([
       {
           $match: {
               date: { $gte: thirtyDaysAgo, $lte: currentDate } // Filter orders within the last 30 days based on the 'date' field
           }
       },
       {
           $group: {
               _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, // Group orders by date
               totalOrders: { $sum: 1 } // Calculate the total number of orders for each date
           }
       },
       {
           $sort: { _id: 1 } // Sort the results by date in ascending order
       }
   ]);
   const dailyDates = dailyOrder.map(item => item._id);
   const dailyOrders = dailyOrder.map(item => item.totalOrders);

   const monthOrders = await Order.aggregate([
    {
        $match: {
            date: { $gte: thirtyDaysAgo, $lte: currentDate } // Filter orders within the last 30 days based on the 'date' field
        }
    },
    {
        $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, // Group orders by month
            totalOrders: { $sum: 1 } // Calculate the total number of orders for each month
        }
    },
    {
        $sort: { _id: 1 } // Sort the results by month in ascending order
    }
]);

const month = monthOrders.map(item => item._id);
const monthlyOrder = monthOrders.map(item => item.totalOrders);

   // Here, 'ordersWithinLast30Days' will contain the aggregated data
   console.log("monthOrder",month);
   console.log("monthlyOrder",monthlyOrder)

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

  const topCatDetails = await cat.aggregate([
    {
      $match: { "_id": { $in: catIds } } // Match product IDs in topProducts
    }
  ]);
  console.log("topProductsDetails",topCatDetails);

        res.render('dashboard',{dailyDates:dailyDates,dailyOrders:dailyOrders,month:month,monthlyOrder:monthlyOrder,procount:procount,ordercount:ordercount,usercount:usercount,catcount:catcount,topProductsDetails:topProductsDetails,topCatDetails:topCatDetails});
    
    
  }catch (error) {
    console.log(error.message);
  }
}

const loadCustomer = async(req,res) => {
    try{

       
        const usersData = await User.find().sort({name : 1})
        console.log(usersData);

        res.render('customers',{users:usersData,req});
    }catch (error) {
        console.log(error.message);
    }
}



    const adminlogout = async (req,res) => {
        try{
            delete req.session.admin;
            res.redirect('/login');
        }catch (error) {
            console.log(error.message)
        }
    }

    //Order page//

    const loadOrder = async(req,res) => {
        try{
            console.log("hiii");

            const orders = await Order.find().populate('user').exec();
            console.log("orders",orders);
            orders.sort((a, b) => b.date - a.date);
           
            res.render('Order',{ orders,req })

        }catch(error) {
            console.log(error.message);
        }
    }

    const loadOrderDetail = async(req,res) => {
        try{
            const orderId = req.params.orderId;
            console.log("orderId",orderId);
            const order = await Order.findById(orderId).populate('user');
           
           
            console.log("orderthis",order.status);
            res.render('orderDetails',{order:order});
        }catch (error) {
            console.log(error.message);
        }
    }


const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        console.log("orderId",orderId)
        const productId = req.params.productId;
        console.log("productId",productId);
       

        const order = await Order.findById(orderId);

        console.log("order.product",order.product);

       const product = order.product.find(pro => String(pro.productId) === productId);
       console.log("product",product);
       product.status = req.body.status;

       console.log("  product.status",  product.status);
       await order.save();
        // Redirect back to the admin dashboard or any other appropriate page
        res.redirect('/admin/Order');
    } catch (error) {
        console.error('Error updating order status:', error);
        // Handle the error, render an error page, or send an error response
        res.status(500).send('Internal Server Error');
    }
};

const loadCoupon = async(req,res,next) => {

    try{

        const coupon = await Coupon.find();
        console.log("coupon",coupon)

        res.render('coupon',{coup:coupon});

    }catch (error) {

        next(error);

    }

}
const loadAddCoupon = async(req,res,next) =>{

    try{


        res.render('addCoupon');

    }catch(error) {
        next(error);
    }
}

const addCoupon = async(req,res,next) => {

    try{

        console.log("heyyyyyyyyyy")
        console.log("req.body.code",req.body.code)

        const code = req.body.code.trim();
        if (!code) {
            return res.render('addCoupon', { message: 'code is required' });
        }

        const existingCoupon = await Coupon.findOne({ code: code });
        if (existingCoupon) {
            return res.render('addCoupon', { message: 'code already exists' });
        }

        const description = req.body.description.trim();
        if (!description) {
            return res.render('addCoupon', { message: 'Description is required' });
        }

        const maxAmt = req.body.maxAmt.trim();
        if (!/^\d+$/.test(maxAmt)) {
            return res.render('addCoupon',{ message: 'maxAmt should be a number',
            });
        }
        if (!maxAmt) {
            return res.render('addCoupon', { message: 'maxAmt is required' });
        }
        if(maxAmt < 0 ) {
            return res.render('addCoupon', { message: 'maxAmt should not be a negative number' });
        }

        const couponAmt = req.body.couponAmt.trim();
        if (!/^\d+(\.\d{1,2})?$/.test(couponAmt)) {
            return res.render('addCoupon',{message: 'couponAmt should be a number',});
        }
        if (!couponAmt) {
            return res.render('addCoupon', { message: 'couponAmt is required' });
        }

        if(couponAmt < 0) {
            return res.render('addCoupon', { message: 'cuoponAmt should not be a negative number' });
        }
        if(maxAmt < couponAmt) {
            return res.render('addCoupon', { message: 'minAmt should be greater than couponAmt' });
        }

        const startDate = req.body.startDate.trim();
        if (!startDate) {
            return res.render('addCoupon', { message: 'startDate is required' });
        }

        const endDate = req.body.endDate.trim();
        if (!endDate) {
            return res.render('addCoupon', { message: 'endDate is required' });
        }
        if(startDate > endDate) {
            return res.render('addCoupon', { message: 'Invalid dates' });
        }
        const coupon = new Coupon({
            code: req.body.code,
            description:req.body.description,
            maxAmt:req.body.maxAmt,
            couponAmt:req.body.couponAmt,
            startDate:req.body.startDate,
            endDate:req.body.endDate
        })
         
        const coup = await coupon.save();
        console.log("coup",coup);

        res.redirect('/admin/coupon')

    }catch (error) {
        next(error);
    }
}

const deleteCoupon = async(req,res,next) => {
    try{
        console.log("here the delete controller");
        const couponId = new mongoose.Types.ObjectId(req.params.couponId);
        console.log("couponId",couponId);

        const coupon = await Coupon.findByIdAndDelete({_id:couponId});
        console.log("coupon",coupon);

        res.status(200).json({sucess:true,deletedProductId:couponId})


    }catch (error) {
        next(error);
    }
}

const loadEditCoupon = async(req,res,next) => {
    try{
        const couponId = new mongoose.Types.ObjectId(req.params.couponId);
        console.log("couponID",couponId);
        const coupon = await Coupon.findById({_id:couponId});
        console.log("couponnbhj",coupon);

        res.render('editCoupon',{coup:coupon});
        
    }catch (error) {
        next(error);
    }
}

const updateCoupon = async(req,res,next) => {
    try{

        console.log("hii,it is here in thr updatecoupon");
        console.log(req.params.couponId);
        const categoryID = req.params.couponId
        const coup = await Coupon.findById(categoryID);
        console.log(coup);

        const code = req.body.code.trim();
        if (!code) {
            return res.render('editCoupon', {coup:coup, message: 'code is required',
           });
        }

        const description = req.body.description.trim();
        if (!description) {
            return res.render('editCoupon',{coup:coup , message: 'Description is required',
        });
        }

        const maxAmt = req.body.maxAmt.trim();
        if (!/^\d+$/.test(maxAmt)) {
            return res.render('editCoupon',{coup:coup , message: 'maxAmt should be a number',
            });
        }

        const couponAmt = req.body.couponAmt.trim();
        if (!/^\d+(\.\d{1,2})?$/.test(couponAmt)) {
            return res.render('editCoupon',{coup:coup , message: 'couponAmt should be a number',});
        }

        coup.code = req.body.code;
        coup.description = req.body.description;
        coup.maxAmt = req.body.maxAmt;
        coup.couponAmt = req.body.couponAmt;
        coup.startDate = req.body.startDate;
        coup.endDate = req.body.endDate;

        const updatedCoupon = await coup.save();

        console.log(updatedCoupon);

        if(updatedCoupon) {
            res.redirect('/admin/coupon')
        }else {
            res.render('editCoupon')
        }

        res.redirect('/admin/coupon')

    }catch (error) {
        next(error);
    }
}

const reqAccepted = async(req,res,next) => {
    try{

        const orderId = req.params.orderId;
        const productId = req.params.productId;
        console.log("orderId",orderId);
        console.log("productId",productId);
        const order = await Order.findById(orderId);
        const orderPro = order.product.find(pro => String(pro.productId) === productId );
        console.log("orderPro456",orderPro);
        orderPro.returnStatus = 'accepted';
        await order.save();
        console.log("orderPro",orderPro);
        const userId = order.user;
        console.log("userId",userId)
        
        const Wallet = await wallet.findOne({ user: userId });
        
          if(order.paymentMethod === "razorpay" || order.paymentMethod === 'wallet') {
          Wallet.balance += parseInt(orderPro.totalPrice);

        console.log(" Wallet.balance", Wallet.balance)
        const newTransaction = {
            amount:orderPro.totalPrice,
            status: 'credited',
            createdAt:Date.now()

        };
        Wallet.trancsaction.push(newTransaction);
          }
        // Push the new transaction object to the transactions array
        
        await Wallet.save();
       
        res.status(200).json({sucess:true})


    }catch(error) {
        next(error);
    }
}

const reqRejected = async(req,res,next) => {
    try{
        const orderId = req.params.orderId;
        const productId = req.params.productId;
        console.log("jiji",orderId);
        console.log("opop",productId);
        const order = await Order.findById(orderId);
        const orderPro = order.product.find(pro => String(pro.productId) === productId );
        console.log("orderPro456",orderPro);
        orderPro.returnStatus = "rejected" ;
        await order.save();
        console.log("orderPro",orderPro);

        res.status(200).json({sucess:true, message: "Request Accepted"})
 
    }catch (error) {
        nexr(error);
    }
}

const loadRefferalOffer = async(req,res) => {
    try{

        const Refferal = await refferal.find();
        console.log("Refferal",Refferal)


        res.render("refferalOffer",{refferal:Refferal});

    }catch (error) {
        console.log(error);
    }
}

const loadEditRefferal = async(req,res) => {
    try{
        const id = req.params.refferalId;
        console.log("id",id);
        const Id = new mongoose.Types.ObjectId(id);
        const Refferal = await refferal.findOne({_id:Id});
        console.log("refferal",Refferal);

        res.render("editRefferal",{refferal:Refferal});

    }catch (error) {
        console.log(error);
    }
}

const editRefferalOffer = async(req,res) => {
    try {
console.log("huuuuu");
const reff = req.params.reffID;
const Id = new mongoose.Types.ObjectId(reff);
        const Refferal = await refferal.findOne({_id:reff});
console.log("req.body.bonus",req.body.bonus);
        const bonus = req.body.bonus.trim();
        if (!bonus) {
            return res.render('editRefferal', { message: 'bonus title is required',refferal:Refferal
    });
        }

        

        // Validate if description is provided and does not contain only spaces
        const signUp = req.body.SignUp.trim();
        if (!signUp) {
            return res.render('editRefferal', { message: 'signUp is required',refferal:Refferal});
        }

        Refferal.refferalBonus = req.body.bonus;
        Refferal.refferalSign = req.body.SignUp;

        await Refferal.save();
        res.redirect('/admin/refferalOffer')
        

    }catch (error) {
        console.log(error);
    }
}

// const pdfDirectory = path.join(__dirname, 'pdfs');
// if (!fs.existsSync(pdfDirectory)) {
//     fs.mkdirSync(pdfDirectory);
// }
// const filePath = path.join(pdfDirectory, filename);
const loadSalesReport = async(req,res) => {
    try{
        let order = 0;

        res.render('salesReport',{order:order});

    }catch (error) {
        console.log(error);
    }
}

const filterData = async(req,res) => {
    try{

        console.log("hellllllo");
        const start = req.body.startDate
        const end = req.body.endDate;
        console.log("start",start);
        console.log("end",end);
        const startComponents = start.split('/');
const endComponents = end.split('/');

// Reconstructing the date strings in YY/MM/DD format
const reversedStartDate = startComponents[1] + '/' + startComponents[0] + '/' + startComponents[2];
const reversedEndDate = endComponents[1] + '/' + endComponents[0] + '/' + endComponents[2];

console.log("Reversed start date:", reversedStartDate);
console.log("Reversed end date:", reversedEndDate);
        const orders = await Order.find({
            date: { $gte: reversedStartDate, $lte: reversedEndDate },
            status: { $ne: "cancelled" }
        });
        // console.log("orders",orders)
        req.session.orders = orders;

        console.log(" req.session.orders", req.session.orders)
        res.render("salesReport",{order:orders})

    }catch (error) {
        console.log(error);
    }
}


const generatePdf = async (req, res) => {
    const browser = await puppeteer.launch({ 
        headless: "new",
        executablePath: '/snap/bin/chromium'
     });
    try {
        console.log("hiii");
        const data = {
            orders : req.session.orders
        }
        console.log("data",data);


        const customTemplate = fs.readFileSync(
            path.join(__dirname, "../views/admin/salesPDF.ejs"),
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
    
       
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {

    loadAdminLogin,
    verifyAdminLogin,
    loadDashboard,
    loadCustomer,
    adminlogout,
    loadOrder,
    loadOrderDetail,
    updateOrderStatus,
    loadCoupon,
    loadAddCoupon,
    addCoupon,
    deleteCoupon,
    loadEditCoupon,
    updateCoupon,
    reqAccepted,
    reqRejected,
    loadRefferalOffer,
    loadEditRefferal,
    editRefferalOffer,
    loadSalesReport,
    filterData,
    generatePdf,
    createAdmin
    
    
}