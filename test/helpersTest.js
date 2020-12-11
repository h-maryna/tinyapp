const { assert } = require('chai');

const { checkEmail, newUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "test"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "hello"
  }
};

//test for the function checkEmail
describe('checkEmail', function() {
  it('should return true with valid email', function() {
    const user = checkEmail(testUsers, "user@example.com");
    const expectedOutput = true;
    assert.equal(user, expectedOutput);
  });
  it('should return false with non valid email', function() {
    const user = checkEmail(testUsers, "ur@example.com");
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});

describe('newUser', function() {
  it('should add a user to the database', function() {
    newUser(testUsers, "56ty54", "marina-chigrin@rambler.ru", "123");
    const expectedOutput = {
      "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "test"
      },
      "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "hello"
      },
      "56ty54": {
        id: "56ty54",
        email: "marina-chigrin@rambler.ru",
        password: "123"
      }
    };
    assert.deepEqual(testUsers, expectedOutput);
  });
})