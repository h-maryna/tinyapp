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


const getID = (email, databaseObj) => {
  for(let id in databaseObj){
    if(databaseObj[id].email === email) {
      return id;
    }
  }
  return false;
};

//function which create a new obj with URL which belong only to certain userID
const urlsForUser = (id, urlDatabase) => {
  const ObjUserID = {};
  for (shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      ObjUserID[shortURL] = urlDatabase[shortURL]
    }
  }
  return ObjUserID;
};



module.exports = { generateRandomString, checkEmail, getID, urlsForUser }; 
