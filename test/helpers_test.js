const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const userData = getUserByEmail(testUsers, "user@example.com");
    const testUser = 'userRandomID';
    const expectedUserData = testUsers[testUser];
    assert.deepEqual(userData, expectedUserData);
  });

  it('should return undefined if the given email does not exist in the dataset', function() {
    const userData = getUserByEmail("user1231@example.com", testUsers);
    const expectedUserData = undefined;
    assert.equal(userData, expectedUserData);
  });
});

describe('urlsForUser', function() {
  const urlDatabase = {
    b2xVn2: { userID: 'user1', longURL: 'http://www.example.com' },
    "9sm5xK": { userID: 'user2', longURL: 'http://www.google.com' },
    dIp8z2: { userID: 'user1', longURL: 'http://www.example2.com' },
    abc123: { userID: 'user3', longURL: 'http://www.example3.com' }
  };

  it('should return URLs belonging to a user', function() {
    const userID = 'user1';
    const expectedURLs = {
      b2xVn2: { userID: 'user1', longURL: 'http://www.example.com' },
      dIp8z2: { userID: 'user1', longURL: 'http://www.example2.com' }
    };

    const userURLs = urlsForUser(userID, urlDatabase);

    assert.deepEqual(userURLs, expectedURLs);
  });

  it('should return an empty object if user has no URLs', function() {
    const userID = 'user4';
    const expectedURLs = {};

    const userURLs = urlsForUser(userID, urlDatabase);

    assert.deepEqual(userURLs, expectedURLs);
  });

  it('should return an empty object if urlDatabase is empty', function() {
    const userID = 'user1';
    const expectedURLs = {};

    const userURLs = urlsForUser(userID, {});

    assert.deepEqual(userURLs, expectedURLs);
  });
});
