// Random string
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateRandomString = function(length) {
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};
///////////////////////////////////////////////////////////////////////
// CONFIG
///////////////////////////////////////////////////////////////////////

const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

///////////////////////////////////////////////////////////////////////
// DATABASE
///////////////////////////////////////////////////////////////////////

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  dIp8z2: "http://www.example.com",
};

///////////////////////////////////////////////////////////////////////
// MIDDLEWARE
///////////////////////////////////////////////////////////////////////

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Middleware to pass username to all views
app.use((req, res, next) => {
  const username = req.body.username; // Replace with your logic to get the username from the session or authentication mechanism
  res.locals.username = username;
  next();
});


///////////////////////////////////////////////////////////////////////
// ROUTES
///////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

///////////////////////////////////////////////////////////////////////
// ROUTES
///////////////////////////////////////////////////////////////////////

// read: index display all urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  console.log(urlDatabase);
  res.render("urls_index", templateVars);
});

// login form
app.post("/login", (req, res) => {
  const users = req.body.username; // Access the username entered by the client
  const templateVars = {
    user: users
  };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render("urls_index", templateVars);
});

// create: create new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  res.redirect('/urls');
});

// show: show single url
app.get("/urls/:id", (req, res) => {
  const key = req.params.id;
  const templateVars = { id: req.params.id, longURL: urlDatabase[key] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const key = req.params.id;
  const longURL = urlDatabase[key];
  res.redirect(longURL);
});

// save: submit create url
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});

// delete; remove a url
app.post("/urls/:id/delete", (req, res) => {
  const key = req.params.id;
  delete urlDatabase[key];
  res.redirect("/urls");
});

// edit: show edit url
app.get("/urls/:id", (req, res) => {
  const key = req.params.id;
  const templateVars = { id: req.params.id, longURL: urlDatabase[key] };
  res.render("/urls_show", templateVars);
});

///////////////////////////////////////////////////////////////////////
// LISTENER
///////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
