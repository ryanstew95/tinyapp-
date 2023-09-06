const { getUserByEmail, generateRandomString, urlsForUser, getUserURLByID } = require("./helpers");
const { urlDatabase, users } = require("./dataBases");

///////////////////////////////////////////////////////////////////////
// CONST
///////////////////////////////////////////////////////////////////////

const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

// Configuration
app.set("view engine", "ejs");

///////////////////////////////////////////////////////////////////////
// MIDDLEWARE
///////////////////////////////////////////////////////////////////////
app.use(express.static("styles"));
app.use(express.urlencoded({ extended: true })); // create/populate req.body
//  🍪🍪🍪
app.use(cookieSession({
  name: 'authentication',
  keys: ['Kh7y6v2Rs'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
//  🍪🍪🍪
// Middleware to pass email to all views
app.use((req, res, next) => {
  const email = req.body.email;
  res.locals.username = email;
  next();
});

///////////////////////////////////////////////////////////////////////
// ROUTES
///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
// GET
///////////////////////////////////////////////////////////////////////

// READ: index display all urls
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  if (!user) {
    return res
      .status(401)
      .send(
        "<h2>You must be logged in to see this page</h2><p>Visit <a href='http://localhost:8080/login'>http://localhost:8080/login</a> to log in or <a href='http://localhost:8080/register'>http://localhost:8080/register</a> to sign up.</p>"
      );
  }
  const userURLs = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userURLs, user };
  res.render("urls_index", templateVars);
});

// DISPLAY register page
app.get("/register", (req, res) => {
  res.render("register");
});

// display login page
app.get("/login", (req, res) => {
  res.render("login");
});

// CREATE: create new url
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];

  // Check if user is logged in
  if (!user) {
    res.redirect("/login");
    return;
  }
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_new", templateVars);
});

// show: show single url
app.get("/urls/:id", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  const key = req.params.id;
  if (!user) {
    res
      .status(401)
      .send(
        "<h2>You must be logged in to see this page</h2><p>Visit <a href='http://localhost:8080/login'>http://localhost:8080/login</a> to log in or <a href='http://localhost:8080/register'>http://localhost:8080/register</a> to sign up.</p>"
      );
  }
  const url = urlDatabase[key];
  if (!url) {
    return res.status(404).send("<h2>URL not found<br>Return to main page<p><a href='http://localhost:8080/urls'>http://localhost:8080/urls</a></p></h2>");
  }
  if (url.userID !== userID) {
    return res.status(403).send("<h2>You do not own this URL<br>Return to main page<p><a href='http://localhost:8080/urls'>http://localhost:8080/urls</a></p></h2>");
  }

  const templateVars = {
    id: req.params.id,
    longURL: null,
    user,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const key = req.params.id;
  const url = urlDatabase[key];

  if (!url) {
    // short URL does not exist
    res.status(404).send("<h2>Short URL not found<br>Return to main page<p><a href='http://localhost:8080/urls'>http://localhost:8080/urls</a></p><h2>");
    return;
  }
  res.redirect(url.longURL);
});

///////////////////////////////////////////////////////////////////////
// POST
///////////////////////////////////////////////////////////////////////

// submission login form
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Look up the email address in the user object
  const user = getUserByEmail(users, email);

  if (!user || !password) {
    return res.status(400).send("<h2>Email does not exist!<p>Visit <a href='http://localhost:8080/login'>http://localhost:8080/login</a> to log in or <a href='http://localhost:8080/register'>http://localhost:8080/register</a> to sign up.</p><h2>");
  }

  // are the passwords NOT the same
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send("<h2>the passwords do not match<br>Return to main page<p><a href='http://localhost:8080/urls'>http://localhost:8080/urls</a></p><h2>");
  }
  
  // HAPPY PATH 🎉
  // set a cookie 🍪
  req.session.userID = user.id;
  res.redirect("/urls");
});

// logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// SUBMISSION sign in
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    res.status(400).send("<h2>Email and password cannot be empty<br>Return to register in page<p><a href='http://localhost:8080/register'>http://localhost:8080/urls</a></p><h2>");
    return;
  }

  // Check if user already exists with the given email
  if (getUserByEmail(users, email)) {
    res.status(400).send("<h2>Email already exists.<br><p>Visit <a href='http://localhost:8080/login'>http://localhost:8080/login</a> to log in or <a href='http://localhost:8080/register'>http://localhost:8080/register</a> to sign up.</p><h2>");
    return;
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  // New user object
  const newUser = {
    id: generateRandomString(6),
    email: email,
    password: hash, // Store the HASHED password!
  };

  users[newUser.id] = newUser;
  req.session.userID = newUser.id;
  res.redirect("/urls");
});

// save: submit create url
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];

  // Check if user is logged in
  if (!user) {
    res.status(401).send("<h2>You must be logged in to shorten URLs.<br><p>Visit <a href='http://localhost:8080/login'>http://localhost:8080/login</a> to log in<h2>"); // Send error message
    return;
  }
  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: userID,
  };
  res.redirect("urls");
});

// DELETE: remove a url
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.userID;
  const url = getUserURLByID(userID, req.params.id, urlDatabase);


  if (!url) {
    return res.status(404).send("<h2>URL not found<br>Return to main page<p><a href='http://localhost:8080/urls'>http://localhost:8080/urls</a></p></h2>");
  }

  if (!userID) {
    return res
      .status(401)
      .send("<h2>You must be logged in to delete this URL<br><p><a href='http://localhost:8080/login'>http://localhost:8080/login</a></p></h2>");
  }

  if (url.userID !== userID) {
    return res.status(403).send("<h2>You do not own this URL<br>Return to main page<p><a href='http://localhost:8080/urls'>http://localhost:8080/urls</a></p></h2>");
  }
  const key = req.params.id;
  delete urlDatabase[key];
  res.redirect("/urls");
});

// UPDATE: show edit url
app.post("/urls/:id", (req, res) => {
  const key = req.params.id;
  const userID = req.session.userID;

  const url = getUserURLByID(userID, key, urlDatabase);

  if (!url) {
    return res.status(404).send("<h2>URL not found<br>Return to main page<p><a href='http://localhost:8080/urls'>http://localhost:8080/urls</a></p></h2>");
  }

  if (!userID) {
    return res
      .status(401)
      .send("<h2>You must be logged in to update this URL<br><p><a href='http://localhost:8080/login'>http://localhost:8080/login</a></p></h2>");
  }

  if (url.userID !== userID) {
    return res.status(403).send("<h2>You do not own this URL<br>Return to main page<p><a href='http://localhost:8080/urls'>http://localhost:8080/urls</a></p></h2>");
  }

  urlDatabase[key].longURL = req.body.longURL;

  res.redirect("/urls");
});

///////////////////////////////////////////////////////////////////////
// LISTENER
///////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

