const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");

///////////////////////////////////////////////////////////////////////
// CONST
///////////////////////////////////////////////////////////////////////

const express = require("express");
// const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

// Configuration
app.set("view engine", "ejs");

///////////////////////////////////////////////////////////////////////
// DATABASE
///////////////////////////////////////////////////////////////////////

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "ObWvTH",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "VRVC4b",
  },
  dIp8z2: {
    longURL: "http://www.example.com",
    userID: "ObWvTH",
  },
};

const users = {
  ObWvTH: {
    id: "ObWvTH",
    email: "a@a.com",
    password: "$2a$10$W04FvS124uxjonDPX3qqFOTocD7LxIVJVWKFJknxvJ0wD9hEtCZUi", // 123
  },
  VRVC4b: {
    id: "VRVC4b",
    email: "b@b.com",
    password: "$2a$10$dikS5Bv7AnRHQRHubuvaP.SdVRutCAe8ZEPOXky4L5pyqLKN/sObe", // 456
  },
};

///////////////////////////////////////////////////////////////////////
// MIDDLEWARE
///////////////////////////////////////////////////////////////////////

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

  console.log(userURLs); // output {}

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
    return res.status(404).send("<h2>URL not found</h2>");
  }
  if (url.userID !== userID) {
    return res.status(403).send("<h2>You do not own this URL</h2>");
  }
  // urlDatabase[key] = req.body.longURL;
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
    res.status(404).send("<h2>Short URL not found<h2>");
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
    return res.status(400).send("<h2>Email does not exist!<h2>");
  }

  // are the passwords NOT the same
  // if (user.password !== password) {
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send("<h2>the passwords do not match<h2>");
  }
  // HAPPY PATH 🎉
  // set a cookie 🍪
  // res.cookie("userID", user.id);
  req.session.userID = user.id;
  res.redirect("/urls");
});

// logout
app.post("/logout", (req, res) => {
  // res.clearCookie("userID");
  req.session.userID = null;
  res.redirect("/login");
});

// SUBMISSION sign in
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    res.status(400).send("<h2>Email and password cannot be empty<h2>");
    return;
  }

  // Check if user already exists with the given email
  if (getUserByEmail(users, email)) {
    res.status(400).send("<h2>Email already exists.<h2>");
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
  console.log('user AFTER REGISTRATION:', users);

  // res.cookie("userID", newUser.id);
  req.session.userID = newUser.id;


  res.redirect("/urls");
});

// save: submit create url
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];

  // Check if user is logged in
  if (!user) {
    res.status(401).send("<h2>You must be logged in to shorten URLs.<h2>"); // Send error message
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
  const url = getUserURLByID(userID, req.params.id);

  if (!url) {
    return res.status(404).send("<h2>URL not found</h2>");
  }

  if (!userID) {
    return res
      .status(401)
      .send("<h2>You must be logged in to delete this URL</h2>");
  }

  if (url.userID !== userID) {
    return res.status(403).send("<h2>You do not own this URL</h2>");
  }
  const key = req.params.id;
  delete urlDatabase[key];
  res.redirect("/urls");
});

// Helper function to get URL specific to the user by ID
const getUserURLByID = (userId, shortURL) => {
  const { longURL, userID } = urlDatabase[shortURL];

  if (longURL && userID === userId) {
    return { longURL, userID };
  }
  return null;
};

// UPDATE: show edit url
app.post("/urls/:id", (req, res) => {
  const key = req.params.id;
  const userID = req.cookies.userID;

  const url = getUserURLByID(userID, key);

  if (!url) {
    return res.status(404).send("<h2>URL not found</h2>");
  }

  if (!userID) {
    return res
      .status(401)
      .send("<h2>You must be logged in to update this URL</h2>");
  }

  if (url.userID !== userID) {
    return res.status(403).send("<h2>You do not own this URL</h2>");
  }
  console.log(req.body);

  urlDatabase[key].longURL = req.body.longURL;

  res.redirect("/urls");
});

///////////////////////////////////////////////////////////////////////
// LISTENER
///////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

