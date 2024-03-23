


function validateOTP(userProvidedOTP, storedOTP) {
    return userProvidedOTP === storedOTP;
}

module.exports = validateOTP;
