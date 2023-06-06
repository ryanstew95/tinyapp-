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
// DATABASE
///////////////////////////////////////////////////////////////////////

module.exports = { urlDatabase, users };