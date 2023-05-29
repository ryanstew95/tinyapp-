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
// Helper function to get user by email
const getUserByEmail = function(users, email) {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};
///////////////////////////////////////////////////////////////////////
// CONFIG
///////////////////////////////////////////////////////////////////////

const express = require("express");
const cookieParser = require("cookie-parser");
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
const newUser = {
  id: generateRandomString(),
  email: "example@example.com",
  password: "password123",
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
  const userID = req.cookies.userID;
  const user = urlDatabase[userID];
  // const username = req.body.username;
  const templateVars = { urls: urlDatabase, username: user };
  res.render("urls_index", templateVars);
});

// login form
app.post("/login", (req, res) => {
  const username = req.body.username; // Access the username
  // const userID = req.cookies.userID;
  // const user = newUser[userID];
  res.cookie("username", username);
  const templateVars = {
    username: username,
  };
  res.render("login", templateVars);
});

// logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// register
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    res.status(400).send("Email and password cannot be empty.");
    return;
  }

  // Check if user already exists with the given email
  if (getUserByEmail(email)) {
    res.status(400).send("Email already exists.");
    return;
  }

  // Create a new user object
  const newUser = {
    id: generateRandomString(),
    email: email,
    password: password,
  };
  const username = req.cookies["username"];
  // Add the new user object to the global users object or your database
  username[newUser.id] = newUser;

  // Set the user ID as a cookie
  res.cookie("userID", newUser.id);

  // Redirect the user to the /urls page
  res.redirect("/urls");
});

// create: create new url
app.get("/urls/new", (req, res) => {
  const userID = req.cookies.userID;
  const user = urlDatabase[userID];
  // const username = req.cookies["username"];
  const templateVars = { urls: urlDatabase, username: user };
  res.render("urls_new", templateVars);
});

// show: show single url
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.userID;
  const user = urlDatabase[userID];
  // const username = req.cookies["username"];
  const key = req.params.id;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[key],
    username: user,
  };
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
  res.redirect("urls");
});

// delete; remove a url
app.post("/urls/:id/delete", (req, res) => {
  const key = req.params.id;
  delete urlDatabase[key];
  res.redirect("/urls");
});

// edit: show edit url
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
