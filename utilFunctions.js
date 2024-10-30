const generateRandomString = function () {
    // generate a random number between 100000 and 999999
    return Math.floor(100000 + Math.random() * 900000);
}

const createNewUser = function (email, password) {
    return {
        id: generateRandomString(),
        email,
        password
    };
}

const addUrlToDB = function (database, req){
 const newUrl = {
     longURL: req.body.longURL,
     userID: req.cookies["user_id"]
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
    if (!user || user.password !== password) {
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
    return !!req.cookies["user_id"];
}

const isUserUrlOwner = function (urlDatabase, urlID, req){
    const userID = req.cookies["user_id"];
    return urlDatabase[urlID].userID === userID;
}

module.exports = {
    generateRandomString,
    createNewUser,
    getUserByEmail,
    getValidatedUser,
    isUserLoggedIn,
    addUrlToDB,
    isUserUrlOwner,
    getUrlsForUser
};