﻿const {
  addUserToDB,
  getUserByEmail,
  getValidatedUser, addUrlToDB, getUrlsForUser, requireLogin, requireOwnership, isUserLoggedIn, performAnalytics
} = require("./helpers");
const cookieSession = require('cookie-session');
const express = require("express");
const methodOverride = require('method-override');
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ["supersecretkey"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'));
const PORT = 8080; // default port 8080

app.use(express.urlencoded({extended: true})); // urlencoded will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the key body
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: {
    longURL: "https://github.com/Setmaster/tinyapp",
    id: "userRandomID",
    visitors: 0,
    uniqueVisitors: 0,
    visitorsList: []
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    id: "user2RandomID",
    visitors: 0,
    uniqueVisitors: 0,
    visitorsList: []
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Route to redirect to /urls if logged in
app.get("/", requireLogin(), (req, res) => {
  res.redirect("/urls");
});

// Route to return the URL database in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route to display the URLs page containing urls owned by the user
app.get("/urls", requireLogin(false), (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
    
  templateVars["urls"] = getUrlsForUser(urlDatabase, req.session.user_id);
  res.render("urls_index", templateVars);
});

// Route to display the page for creating a new URL
app.get("/urls/new", requireLogin(), (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

// Route to display a specific URL and its details
app.get("/urls/:id", requireLogin(false), requireOwnership(urlDatabase), (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id],
    visitors: urlDatabase[req.params.id].visitors,
    uniqueVisitors: urlDatabase[req.params.id].uniqueVisitors,
    visitorsList: urlDatabase[req.params.id].visitorsList
  };
    
  res.render("urls_show", templateVars);
});

// Route to display the registration page if the user isn't logged in
app.get("/register", (req, res) => {
  if (isUserLoggedIn(req)) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("register", templateVars);
});

// Route to display the login page if the user isn't logged in
app.get("/login", (req, res) => {
  if (isUserLoggedIn(req)) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user: users[req.session.user_id],
  };

  res.render("login", templateVars);
});

// Simple hello world route
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Route to redirect to the long URL, with analytics performed
app.get("/u/:id", performAnalytics(urlDatabase),(req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
    
  res.redirect(longURL);
});

// Route for a user to delete an owned URL
app.delete("/urls/:id", requireLogin(), requireOwnership(urlDatabase), (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls/`);
});

// Route for user to modify an owned URL
app.put("/urls/:id", requireLogin(), requireOwnership(urlDatabase), (req, res) => {
  if (!req.body.longURL) {
    res.status(400).send(`400 Error: Your new url value is invalid`);
    return;
  }
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect(`/urls/`);
});

// Route to create a new short URL for a logged-in user
app.post("/urls", requireLogin(), (req, res) => {
  if (!req.body.longURL) {
    res.status(400).send(`400 Error: Your url is invalid`);
    return;
  }
  const id = addUrlToDB(urlDatabase, req);
  res.redirect(`/urls/${id}`);
});

// Route to log a user in setting the cookie
app.post("/login", (req, res) => {
  if (!req.body.email) {
    res.status(400).send(`400 Error: Invalid email address`);
    return;
  }
  if (!req.body.password) {
    res.status(400).send(`400 Error: Invalid password`);
    return;
  }
  const user = getValidatedUser(users, req.body.email, req.body.password);
  if (!user) {
    res.status(403).send(`400 Error: User not found`);
    return;
  }

  req.session.user_id = user.id;
  res.redirect(`/urls/`);
});

// Route to log a user out and clear the cookie
app.post("/logout", (req, res) => {
  req.session = null; // this version fully deletes the cookie, at the cost of unique version tracking precision
  // req.session.user_id = null; // this should be the correct version for unique visitor tracking to work correctly
  res.redirect(`/login/`);
});

// Route to register a new user, also sets a cookie
app.post("/register", (req, res) => {
  if (!req.body.email) {
    res.status(400).send(`400 Error: Invalid email address`);
    return;
  }
  if (!req.body.password) {
    res.status(400).send(`400 Error: Invalid password`);
    return;
  }
  if (getUserByEmail(users, req.body.email)) {
    res.status(400).send(`400 Error: Email already in use`);
    return;
  }
  const newid = addUserToDB(users, req.body.email, req.body.password);

  req.session.user_id = newid;
  res.redirect(`/urls/`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});