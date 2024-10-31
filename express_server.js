const {
    addUserToDB,
    getUserByEmail,
    getValidatedUser, addUrlToDB, getUrlsForUser, requireLogin, requireOwnership, isUserLoggedIn
} = require("./helpers")
var cookieSession = require('cookie-session')
const express = require("express");
const app = express();
app.use(cookieSession({
    name: 'session',
    keys: ["supersecretkey"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const PORT = 8080; // default port 8080

app.use(express.urlencoded({extended: true})); // urlencoded will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the key body
app.set("view engine", "ejs");

const urlDatabase = {
    b2xVn2: {
        longURL: "https://github.com/Setmaster/tinyapp",
        id: "userRandomID"
    },
    "9sm5xK": {
        longURL: "http://www.google.com",
        id: "user2RandomID"
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

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", requireLogin, (req, res) => {
    const templateVars = {
        user: users[req.session.user_id],
    };
    
    templateVars["urls"] = getUrlsForUser(urlDatabase, req.session.user_id);
    res.render("urls_index", templateVars);
});

app.get("/urls/new", requireLogin, (req, res) => {
    const templateVars = {
        user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", requireLogin, requireOwnership(urlDatabase), (req, res) => {
    const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: users[req.session.user_id],
    };
    
    res.render("urls_show", templateVars);
});

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

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:id", requireLogin, requireOwnership(urlDatabase), (req, res) => {
    const longURL = urlDatabase[req.params.id].longURL;

    res.redirect(longURL);
});

app.post("/urls/:id/delete", requireLogin, requireOwnership(urlDatabase), (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls/`);
});

app.post("/urls/:id", requireLogin, requireOwnership(urlDatabase), (req, res) => {
    if (!req.body.longURL) {
        res.status(400).send(`400 Error: Your new url value is invalid`);
        return;
    }
    const id = req.params.id;
    urlDatabase[id].longURL = req.body.longURL;
    res.redirect(`/urls/`);
});

app.post("/urls", requireLogin, (req, res) => {
    if (!req.body.longURL) {
        res.status(400).send(`400 Error: Your url is invalid`);
        return;
    }
    const id = addUrlToDB(urlDatabase, req);
    res.redirect(`/urls/${id}`);
});

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

app.post("/logout", (req, res) => {
    req.session = null; // destroy session
    res.redirect(`/login/`);
});

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