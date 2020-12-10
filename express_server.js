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
    password: "purple-monkey-dinosaur"
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

const checkEmail = (emailToCheck, databaseObj) => {
  let bool = false;
  for (elem in databaseObj){
    if (databaseObj[elem].email === emailToCheck){
      bool = true
    }
  }
    return bool;
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

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["userID"]] };
  res.render("urls_register", templateVars);
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
  const username = req.body.username;
  res.cookie('name', username);
  res.redirect('/urls');
});

app.post ("/register", (req, res) => {
  if (checkEmail(req.body.email, users) !== true){
    const id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    newUser(users, id, email, password);
    res.cookie('userID', id);
    console.log(users);
    res.redirect("/urls");
  } else {
    res.statusCode = 400;
    res.send("Your email is registered already. Please proceed to the login page");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});