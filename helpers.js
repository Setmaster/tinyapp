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
     id: req.session.user_id,
     visitors: 0,
     uniqueVisitors: 0,
     visitorsList: []
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

const getUrlsForUser = function (urlDatabase, id){
    const output = {};
    for (const urlID of Object.keys(urlDatabase)) {
        if (urlDatabase[urlID].id === id){
            output[urlID] = urlDatabase[urlID]
        }
    }
    return output;
}

const performAnalytics = function (urlDatabase){
    return function (req, res, next){
        if (!urlDatabase[req.params.id]) {
            return res.status(400).send(`400 Error: Your url id is invalid`);
        }
        
        urlDatabase[req.params.id].visitors += 1;
        
        if (!req.session.visitor_id){
            req.session.visitor_id = generateRandomString();
        }
        
        if (urlDatabase[req.params.id].visitorsList.find(visitorEntry => visitorEntry.id === req.session.visitor_id)){
            console.log(urlDatabase);
            next();
            return;
        }

        urlDatabase[req.params.id].visitorsList.push({
           id: req.session.visitor_id, 
            timestamp: new Date().getTime()
        });

        urlDatabase[req.params.id].uniqueVisitors += 1;
        console.log(urlDatabase);
        next();
    };
}

const isUserLoggedIn = function (req){
    return req.session && req.session.user_id;
}

const isUserUrlOwner = function (urlDatabase, urlID, req){
    const id = req.session.user_id;
    return urlDatabase[urlID].id === id;
}

const requireLogin = function (req, res, next) {
    if (!isUserLoggedIn(req)) {
        return res.redirect("/login");
    }
    next();
};

const requireOwnership = function (urlDatabase) {
    return function (req, res, next) {
        if (!urlDatabase[req.params.id]) {
            return res.status(404).send(`404 Error: Can't find TinyUrl for ${req.params.id}`);
        }
        if (!isUserUrlOwner(urlDatabase, req.params.id, req)) {
            return res.status(403).send(`403 Error: You do not own this url and can't see it`);
        }
        next();
    };
};

module.exports = {
    generateRandomString,
    addUserToDB,
    getUserByEmail,
    getValidatedUser,
    addUrlToDB,
    getUrlsForUser,
    isUserLoggedIn,
    requireLogin,
    requireOwnership,
    performAnalytics
};