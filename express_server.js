const { generateRandomString, checkEmail, newUser, getID } = require("./helpers.js");
const PORT = 8080; // default port 8080
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');


app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2":  { longURL: "http://www.lighthouselabs.ca", userID: "sesji5" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "sotsx4" }
};

const users = { 
  "sesji5": {
    id: "sesji5", 
    email: "user@example.com", 
    password: bcrypt.hashSync("test", 10)
  },
 "sotsx4": {
    id: "sotsx4", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("123", 10)
  }
};


//function which create a new obj with URL which belong only to certain userID
//function that returns the URLs of a user by his id
const urlsForUser = function(urlObj, id) {
  const res = [];
  for (let url in urlObj) {
    if (urlObj[url]['userID'] === id) {
      res.push(url);
    }
  }
  return res;
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
  if (!req.cookies["userID"]) {
    res.redirect("/login")
  } else {
    const templateVars = { user: users[req.cookies["userID"]], urls : urlDatabase };
  //const templateVars = { urls: urlDatabase };
  res.render("urls_new", templateVars);
  } 
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies["userID"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"] };
  res.render("urls_show", templateVars);
});


// Functionality for creating a new url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  console.log(req.body);  // Log the POST request body to the console
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
  //res.redirect(urlDatabase[shortURL]);
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)

});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!Object.prototype.hasOwnProperty.call(urlDatabase,shortURL)) {
    res.status(404);
    res.send("404 NOT FOUND");
  } else {
    const longURL = urlDatabase[shortURL]["longURL"];
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

app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});


// Functionality for creating cookies
app.post("/login", (req, res) => {
  //let user = null;
  //const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const userID = getID(email, users);
  const user = users[userID];
  console.log(user);
  console.log(email, userID);
  if (user.email !== req.body.email || user.password !== req.body.password) {
    res.status(403);
    res.send("<h3>Email does not exist or incorrect password</h3>");
  } else {
    console.log(user);
    res.cookie('userID', userID);
    res.redirect("/urls");
  }
});

// Functionality for getting results from registration page
app.post ("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});