
const Address = require('../model/userAddressModel');



const loadAccount = async (req,res) => {
    try {
        res.render('account',{user:req.session.user});
    }catch (error) {
        console.log(error.message);
    }
}
const loadSavedAddress = async(req,res) => {
    try {
        const userId = req.session.user._id;
        const address = await Address.find({ user: userId })
        res.render('savedAddress',{userAddr:address,user:req.session.user});
    }catch (error) {
        console.log(error.message);
    }
}
const loadAddAddress = async(req,res) => {
    try {
        res.render('addAddress',{user:req.session.user});
    } catch (error) {
        console.log(error.message);
    }
}

const addAddr = async(req,res) => {
    try{

       const userId = req.session.user._id;

       const userName = req.body.name.trim();
       const mobile = req.body.mobile.trim();
       const pincode = req.body.pincode.trim();
       const address = req.body.address.trim();
       const city = req.body.city.trim();
       if (!userName || !mobile || !pincode || !address || !city) {
           return res.render('addAddress', { message: 'all fields are required',
           user:req.session.user});
       }
       if (!/^\d{6}$/.test(pincode)) {
        return res.render('addAddress', { message: 'pincode must be exactly 6 digits' ,
        user:req.session.user });
    }
    if (!/^\d+$/.test(mobile)) {
        return res.render('addAddress', { message: 'mobile should be a number',
        user:req.session.user });
    }
    if (/^0+$/.test(mobile)) {
        return res.render('addAddress', { 
            message: ' Invalid mobile number',
            user: req.session.user 
        });

    }
    if (!/^\d{10}$/.test(mobile)) {
        return res.render('addAddress', { message: 'Mobile number must be exactly 10 digits' ,
        user:req.session.user });
    }
        const addr = new Address({
            user:userId,
            name : req.body.name,
            mobile:req.body.mobile,
            pincode:req.body.pincode,
            address : req.body.address,
            city:req.body.city

        })

        const  Addr = await addr.save();

        if(Addr) {
            res.redirect('/savedAddress')
        }else{
            res.render('addAddress');
        }


    }catch (error) {
        console.log(error.message);
    }
}

const loadEditAddress = async(req,res) => {
    try {
        const addressId = req.query.id;
        const addredit = await Address.findById(addressId)
        console.log("address",addredit)
        res.render('editAddress',{address : addredit,user:req.session.user});
        
    }catch (error) {
        console.log(error.message);
    }
}

const upadateAddress = async(req,res) => {
    try{
        const userId = req.session.user._id;
        const addressId = req.params.addressId;
        const addredit = await Address.findById(addressId)
        const userName = req.body.name.trim();
        const mobile = req.body.mobile.trim();
        const pincode = req.body.pincode.trim();
        const address = req.body.address.trim();
        const city = req.body.city.trim();
        if (!userName || !mobile || !pincode || !address || !city) {
            return res.render('editAddress', { message: 'all fields are required',
            user:req.session.user,
            address : addredit
        });
        }
        if (!/^\d{6}$/.test(pincode)) {
         return res.render('editAddress', { message: 'pincode must be exactly 6 digits' ,
         user:req.session.user,
         address : addredit
         });
     }
     if (!/^\d+$/.test(mobile)) {
         return res.render('editAddress', { message: 'mobile should be a number',
         user:req.session.user,
         address : addredit
         });
     }
     if (/^0+$/.test(mobile)) {
         return res.render('editAddress', { 
             message: ' Invalid mobile number',
             user: req.session.user ,
             address : addredit
         });
 
     }
     if (!/^\d{10}$/.test(mobile)) {
         return res.render('editAddress', { message: 'Mobile number must be exactly 10 digits' ,
         user:req.session.user,
         address : addredit
         });
     }
        const existingAddress = await Address.findById(addressId)
        console.log("existingAddress",existingAddress);
     
        // existingAddress.user = userId,
        existingAddress.name = req.body.name;
        existingAddress.mobile = req.body.mobile;
        existingAddress.pincode = req.body.pincode;
        existingAddress.address = req.body.address;
        existingAddress.city = req.body.city;

        const updatedAddress = await existingAddress.save();
        console.log("updatedAddress",updatedAddress);

        if(updatedAddress){
        res.redirect('/savedAddress')
        }else{
            res.render('editAddress')
        }
        
    }catch(error) {
        console.log(error.message);
    }
}

const deleteAddress = async(req,res) => {
    try{

         const addressId = req.params.addressId;

        // Find the address by ID and remove it
        const deletedAddress = await Address.findByIdAndDelete(addressId);

        if (deletedAddress) {
            res.redirect('/savedAddress'); // Redirect to the saved addresses page after deletion
        } else {
            res.status(404).send('Address not found.');
        }

    }catch(error) {
        console.log(error.message);
    }
}

module.exports = {
    loadAccount,
     loadSavedAddress,
     loadAddAddress,
     addAddr,
     loadEditAddress,
     upadateAddress,
     deleteAddress,
}