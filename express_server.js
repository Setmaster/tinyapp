const {generateRandomString} = require("./utilFunctions")
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true })); // urlencoded will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the key body

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
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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

app.post("/urls", (req, res) => {
    // format {longUrl: <url>}
    if (!req.body.longURL){
        res.status(400).send(`400 Error: Your url is invalid`);
    }
    const id = generateRandomString();
    urlDatabase[id] = req.body.longURL;
    res.redirect(`/urls/${id}`);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});