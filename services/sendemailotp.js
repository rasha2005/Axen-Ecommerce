const nodemailer = require('nodemailer');
const mailgen = require('mailgen');


function sendOTPByEmail(userEmail, otp) {
let config = {
    service: 'gmail',
    auth : {
        user:process.env.EMAIL,
        pass: process.env.PASSWORD
    }
}

let transporter = nodemailer.createTransport(config);

let mailGenerator = new mailgen({
    theme: "default",
    product: {
        name:"rasha",
        link: 'https://mailgen.js/'
    }
})

let response = {
    body: {
        name:"rasha",
        intro:"This is is Aysha Rasha.C",
        table: {
            data:[
                {

               
                description: `your OTP is ${otp}`,
               

                }
            ]
        },
        outro: "Thank You for ypur time ,Have a nice day"
    }
}

let mail = mailGenerator.generate(response)

let message = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: "testing",
    html: mail

}
transporter.sendMail(message).then(() => {
    console.log('Email sent successfully');
}).catch(error => {
    console.error('Error sending email:', error);
});
}

module.exports = sendOTPByEmail;