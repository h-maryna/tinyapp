const PORT = 8080; // default port 8080
const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));
app.set("view engine", "ejs");
const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "398re4" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "4ur456" }
};

const users = { 
  "398re4": {
    id: "398re4", 
    email: "user@example.com", 
    password: "test"
  },
 "4ur456": {
    id: "4ur456", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const newUser = function(obj, id, email, password) {
  obj[id] = {"id": id, "email": email, "password": password};
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
  const templateVars = {user: users[req.session.userID], urls: urlDatabase };
  console.log(templateVars);
  //const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.session.userID]
    };
  //const templateVars = { urls: urlDatabase };
  res.render("urls_new", templateVars);
  }
});

// Functionality for displaying a registration form
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.userID]};
  res.render("urls_register", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.session.userID], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], userID: urlDatabase };
  //const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});


// Functionality for creating a new url
app.post("/urls/", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {'longURL': longURL, "userID": req.session["userID"] };
  res.redirect('/url');
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!Object.prototype.hasOwnProperty.call(urlDatabase,shortURL)) {
    res.status(404);
    res.send("404 NOT FOUND");
  } else {
    const longURL = urlDatabase[shortURL]['longURL'];
    res.redirect(longURL);
  }
});

// Functionality for deleting urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Functionality for updating urls
app.post("/urls/:shortURL/Update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});

//show the login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.userID]};
  res.render("urls_login", templateVars);
});

// Functionality for login by an email
app.post("/login", (req, res) => {

  const user = req.body.email;
  const password = req.body.password;
  /**if (user.email !== req.body.email) {
    res.status(403);
    res.send("<h2> Email Doesn't exist or wrong password</h2>");
  } else if (user.email === req.body.email && user.password === req.body.password) {**/
    req.session.userID = user.id;
    res.redirect('/urls');
  //}
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


// Show the registration page with the form

app.post("/register", (req, res) => {
  let id = "user" + generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if(email === "" || password === ""){
    res.status(404);
    res.send("404 NOT FOUND");
  } else {
  newUser (users, id, email, password);
  res.session.userID = id;
  res.redirect('/urls');
  console.log(users);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});