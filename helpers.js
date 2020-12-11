const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};


//function to check if an email already exists in users
const checkEmail = function(obj, email) {
  const keys = Object.keys(obj);
  for (let k of keys) {
    if (obj[k]['email'] === email) {
      return true;
    }
  }
  return false;
};

const newUser = function(obj, id, email, password) {
  obj[id] = {"id": id, 'email': email, 'password': password};
};


const getID = (email, databaseObj) => {
  for(let id in databaseObj){
    if(databaseObj[id].email === email) {
      return id;
    }
  }
  return false;
};


module.exports = { generateRandomString, checkEmail, newUser, getID }; 