const bcrypt = require("bcryptjs");

const generateRandomString = function () {
    // generate a random number between 100000 and 999999
    return Math.floor(100000 + Math.random() * 900000);
}

const addUserToDB = function (database, email, password) {
    const newUser = {
        id: generateRandomString(),
        email,
        password: bcrypt.hashSync(password, 10)
    };
    
    database[newUser.id] = newUser;
    
    return newUser.id;
}

const addUrlToDB = function (database, req){
 const newUrl = {
     longURL: req.body.longURL,
     userID: req.session.user_id
 };
 const id = generateRandomString();
 database[id] = newUrl;
 
 return id;
}

const getUserByEmail = function (users, email) {
    for (const userKey of Object.keys(users)) {
        if (users[userKey].email === email) {
            return users[userKey];
        }
    }

    return null;
}

const getValidatedUser = function (users, email, password) {
    const user = getUserByEmail(users, email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return null;
    }

    return user;
}

const getUrlsForUser = function (urlDatabase, userID){
    const output = {};
    for (const urlID of Object.keys(urlDatabase)) {
        if (urlDatabase[urlID].userID === userID){
            output[urlID] = urlDatabase[urlID]
        }
    }
    return output;
}

const isUserLoggedIn = function (req){
    return req.session && req.session.user_id;
}

const isUserUrlOwner = function (urlDatabase, urlID, req){
    const userID = req.session.user_id;
    return urlDatabase[urlID].userID === userID;
}

module.exports = {
    generateRandomString,
    addUserToDB,
    getUserByEmail,
    getValidatedUser,
    isUserLoggedIn,
    addUrlToDB,
    isUserUrlOwner,
    getUrlsForUser
};