const {generateRandomString} = require("./utilFunctions")
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // urlencoded will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the key body
app.set("view engine", "ejs");

const urlDatabase = {
    b2xVn2: "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
    const templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"],
    };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    const templateVars = {
        username: req.cookies["username"],
    };
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
    const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id],
        username: req.cookies["username"],
    };
    res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id];
    if (!longURL){
        res.status(404).send(`404 Error: Can\`t find TinyUrl for ${req.params.id}`);
    }
    res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
    if (!urlDatabase[req.params.id]){
        res.status(400).send(`400 Error: Your id is invalid`);
    }
    delete urlDatabase[req.params.id];
    res.redirect(`/urls/`);
});

app.post("/urls/:id", (req, res) => {
    if (!urlDatabase[req.params.id]){
        res.status(400).send(`400 Error: Your id is invalid`);
    }
    if (!req.body.longURL){
        res.status(400).send(`400 Error: Your url is invalid`);
    }
    const id = req.params.id;
    urlDatabase[id] = req.body.longURL;
    res.redirect(`/urls/`);
});

app.post("/urls", (req, res) => {
    if (!req.body.longURL){
        res.status(400).send(`400 Error: Your url is invalid`);
    }
    const id = generateRandomString();
    urlDatabase[id] = req.body.longURL;
    res.redirect(`/urls/${id}`);
});

app.post("/login", (req, res) => {
    if (!req.body.username){
        res.status(400).send(`400 Error: Your username is invalid`);
    }
    res.cookie('username', req.body.username);
    res.redirect(`/urls/`);
});

app.post("/logout", (req, res) => {
    res.clearCookie('username', req.body.username);
    res.redirect(`/urls/`);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});