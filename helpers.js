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
// helper function
const urlsForUser = function(id, urlDatabase) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL]["longURL"];
    }
  }
  return userURLs;
};


// Helper function to get URL specific to the user by ID
const getUserURLByID = (userId, shortURL, urlDatabase) => {
  const { longURL, userID } = urlDatabase[shortURL];

  if (longURL && userID === userId) {
    return { longURL, userID };
  }
  return null;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser, getUserURLByID };