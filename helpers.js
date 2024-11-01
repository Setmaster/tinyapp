const bcrypt = require("bcryptjs");

// Generates a random number between 100000 and 999999
const generateRandomString = function() {
  return Math.floor(100000 + Math.random() * 900000);
};

// Adds a new user to the database with a hashed password and returns the new user ID
const addUserToDB = function(database, email, password) {
  const newUser = {
    id: generateRandomString(),
    email,
    password: bcrypt.hashSync(password, 10)
  };
    
  database[newUser.id] = newUser;
    
  return newUser.id;
};

// Adds a new URL to the database for the logged-in user and returns the new URL ID
const addUrlToDB = function(database, req) {
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
};

// Retrieves a user object by email from the users database, returns null if not found
const getUserByEmail = function(users, email) {
  for (const userKey of Object.keys(users)) {
    if (users[userKey].email === email) {
      return users[userKey];
    }
  }

  return null;
};

// Validates a user by checking if the email exists and the password matches the hashed password
const getValidatedUser = function(users, email, password) {
  const user = getUserByEmail(users, email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return null;
  }

  return user;
};

// Retrieves all URLs associated with a specific user ID from the URL database
const getUrlsForUser = function(urlDatabase, id) {
  const output = {};
  for (const urlID of Object.keys(urlDatabase)) {
    if (urlDatabase[urlID].id === id) {
      output[urlID] = urlDatabase[urlID];
    }
  }
  return output;
};

// Checks if a user is logged in by verifying the presence of a user ID in the session
const isUserLoggedIn = function(req) {
  return req.session && req.session.user_id;
};

const isUserUrlOwner = function(urlDatabase, urlID, req) {
  const id = req.session.user_id;
  return urlDatabase[urlID].id === id;
};

// Middleware to require a user to be logged in to access a route
// Optionally redirects to the login page or sends a 401 status
const requireLogin = function(redirect = true) {
    return function(req, res, next) {
        if (!isUserLoggedIn(req)) {
            if (redirect) {
                return res.redirect("/login");
            } else {
                return res.status(401).send(`401 Unauthorized: You must be logged in to access this page`);
            }
        }
        next();
    };
};

// Middleware to require ownership of a URL for access or modification
const requireOwnership = function(urlDatabase) {
  return function(req, res, next) {
    if (!urlDatabase[req.params.id]) {
      return res.status(404).send(`404 Error: Can't find TinyUrl for ${req.params.id}`);
    }
    if (!isUserUrlOwner(urlDatabase, req.params.id, req)) {
      return res.status(403).send(`403 Error: You do not own this url and can't see it`);
    }
    next();
  };
};

// Middleware to perform analytics by tracking visitor data for a URL
const performAnalytics = function(urlDatabase) {
    return function(req, res, next) {
        if (!urlDatabase[req.params.id]) {
            return res.status(400).send(`400 Error: Your url id is invalid`);
        }

        urlDatabase[req.params.id].visitors += 1;

        if (!req.session.visitor_id) {
            req.session.visitor_id = generateRandomString();
        }

        if (urlDatabase[req.params.id].visitorsList.find(visitorEntry => visitorEntry.id === req.session.visitor_id)) {
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