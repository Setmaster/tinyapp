const generateRandomString = function (){
    // generate a random number between 100000 and 999999
    return Math.floor(100000 + Math.random() * 900000);
}

module.exports = {generateRandomString};