const mongoose = require("mongoose");
const dotenv = require("dotenv");
const catmiddleware = require('./middleware/catmiddleware');
const  errormiddleware = require('./middleware/errormiddleware');
const path = require('path');
const adminauth = require('./middleware/adminauth');




dotenv.config();

mongoose
.connect(process.env.MONGO_URL) 
.then(() => console.log("DB connected succefully"))
.catch((err) => {
    console.log(err);
})


const express = require("express")
const app = express();

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    // Set cache control headers to prevent caching for all routes
    res.set('Cache-Control', 'no-store, must-revalidate');
    next();
});

app.set("view engine","ejs")

app.set('views', './views/users');

app.set('views', './views/admin');




app.use(express.static('public'));

app.use(express.static('multer'));

app.use(catmiddleware);

//for user routes
const userRoute = require('./routes/userRoute')
const userAddressRoute = require('./routes/userAddressRoute')
const cartRoute = require('./routes/cartRoute')
const orderRoute = require('./routes/orderRoute');

app.use('/',userRoute);
app.use('/',userAddressRoute)
app.use('/',cartRoute);
app.use('/',orderRoute);





//for admin routes
const adminRoute = require('./routes/adminRoute')
const categoryRoute = require('./routes/categoryRoute')
const productRoute = require('./routes/productRoute');
app.use('/admin',adminRoute);
app.use('/admin',categoryRoute);
app.use('/admin',productRoute);

app.set('views', path.join(__dirname, 'views'));
app.use(errormiddleware);


app.listen(process.env.PORT,()=>{
    console.log(`server is running on http://localhost:${process.env.PORT}`);
})
 