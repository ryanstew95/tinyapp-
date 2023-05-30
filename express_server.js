const { getUserByEmail, generateRandomString } = require('./helpers');

///////////////////////////////////////////////////////////////////////
// CONFIG
///////////////////////////////////////////////////////////////////////

const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

///////////////////////////////////////////////////////////////////////
// DATABASE
///////////////////////////////////////////////////////////////////////

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  dIp8z2: "http://www.example.com",
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

///////////////////////////////////////////////////////////////////////
// MIDDLEWARE
///////////////////////////////////////////////////////////////////////

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
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
  const userID = req.cookies.userID;
  const user = users[userID];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

// register page
app.get("/register", (req, res) => {
  res.render("register");
});

// login page
app.get("/login", (req, res) => {
  res.render("login");
});

// CREATE: create new url
app.get("/urls/new", (req, res) => {
  const userID = req.cookies.userID;
  const user = users[userID];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_new", templateVars);
});

// show: show single url
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.userID;
  const user = users[userID];
  const key = req.params.id;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[key],
    user,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const key = req.params.id;
  const longURL = urlDatabase[key];
  res.redirect(longURL);
});

///////////////////////////////////////////////////////////////////////
// POST
///////////////////////////////////////////////////////////////////////

// login form
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(users, email);

  if (user && user.password === password) {
    res.cookie('userID', user.id); // Set the user_id cookie
    res.redirect('/urls');
  } else {
    res.render("login", { error: "Invalid email or password" });
  }
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie("userID"); // Clear the user_id cookie
  res.redirect("/login"); // Redirect to the login page
});

// sign in
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    res.status(400).send("Email and password cannot be empty.");
    return;
  }

  // Check if user already exists with the given email
  if (getUserByEmail(users, email)) {
    res.status(400).send("Email already exists.");
    return;
  }

  // New user object
  const newUser = {
    id: generateRandomString(6),
    email: email,
    password: password,
  };

  users[newUser.id] = newUser;

  res.cookie("userID", newUser.id); // Set the user_id cookie

  res.redirect("/urls");
});

// save: submit create url
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect("urls");
});

// DELETE: remove a url
app.post("/urls/:id/delete", (req, res) => {
  const key = req.params.id;
  delete urlDatabase[key];
  res.redirect("/urls");
});

// UPDATE: show edit url
app.post("/urls/:id", (req, res) => {
  const key = req.params.id;
  urlDatabase[key] = req.body.longURL;
  res.redirect("/urls");
});


///////////////////////////////////////////////////////////////////////
// LISTENER
///////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
