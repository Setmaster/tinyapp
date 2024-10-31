const { assert } = require('chai');

const { getUserByEmail, getUrlsForUser } = require('../helpers.js');

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


const urlDatabase = {
  b2xVn2: {
    longURL: "https://github.com/Setmaster/tinyapp",
    id: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    id: "user2RandomID"
  },
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return null for a user that doesn\'t exist', function() {
    const user = getUserByEmail(testUsers, "user@null.com");
    const expectedResult = null;
    assert.strictEqual(user, expectedResult);
  });
});

describe('getUrlsForUser', function() {
  it('should return the URLs for a specific user ID', function() {
    const userId = "userRandomID";
    const expectedOutput = {
      b2xVn2: {
        longURL: "https://github.com/Setmaster/tinyapp",
        id: "userRandomID"
      }
    };
    const result = getUrlsForUser(urlDatabase, userId);
    assert.deepEqual(result, expectedOutput, 'The output should match the expected URL data for the user.');
  });

  it('should return an empty object if the user has no URLs', function() {
    const userId = "nonExistentUserID";
    const expectedOutput = {};
    const result = getUrlsForUser(urlDatabase, userId);
    assert.deepEqual(result, expectedOutput, 'The output should be an empty object for a user with no URLs.');
  });

  it('should return an empty object if the URL database is empty', function() {
    const emptyDatabase = {};
    const userId = "userRandomID";
    const expectedOutput = {};
    const result = getUrlsForUser(emptyDatabase, userId);
    assert.deepEqual(result, expectedOutput, 'The output should be an empty object when the URL database is empty.');
  });
});
