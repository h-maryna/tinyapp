const PORT = 8080; // default port 8080
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "test"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const newUser = function(obj, id, email, password) {
  obj[id] = {"id": id, 'email': email, 'password': password};
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

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Getting all urls 
app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies["userID"]], urls: urlDatabase };
  //const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["userID"]], urls : urlDatabase };
  //const templateVars = { urls: urlDatabase };
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies["userID"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  //const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});


// Functionality for creating a new url
app.post("/urls/", (req, res) => {
  let shortURL = generateRandomString();
  console.log(req.body);  // Log the POST request body to the console
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/url/');
  //res.redirect(urlDatabase[shortURL]);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)

});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!Object.prototype.hasOwnProperty.call(urlDatabase,shortURL)) {
    res.status(404);
    res.send("404 NOT FOUND");
  } else {
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  }
});

// Functionality to be able to see the register form
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["userID"]] };
  res.render("urls_register", templateVars);
});

// Functionality to be able to see the login 
app.get ("/login", (req, res) => {
  const templateVars = {user: users[req.cookies["userID"]] };
  res.render("urls_login", templateVars);
});

// Functionality for deleting urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(shortURL, "We see it!");
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Functionality for updating urls
app.post("/urls/:shortURL/Update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/');
});

// Functionality for creating cookies
app.post("/login", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  /**if (!email ||!password) {
    res.status(403);
    res.send("<h3>Email does not exist or incorrect password</h3>");
  } else {**/
    user = users[id];
    res.cookie('userID', id);
    res.redirect("/urls");
  //}
});

// Functionality for getting results from registration page
app.post ("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "" || checkEmail(users, email)) {
    res.status(404),
    res.send("<h3>Hmm, seems you've alrady registered. Please proceed to the login page.</h3>");
  } else {
    newUser(users, id, email, password);
    res.cookie('userID', id);
    console.log(users);
    res.redirect("/urls");
  } 
  console.log(users);
});

app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});