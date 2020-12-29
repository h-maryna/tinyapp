const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080;
const { checkEmail, getID, generateRandomString, urlsForUser } = require('./helpers');
const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  keys: ["user_id"]
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


//obj with shortnames for testing purpose
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "test" }
};

//obj with user id, names and emails for testing purpose
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("123", 10)
  },
  "test": {
    id: "test",
    email: "test1@t.ca",
    password: bcrypt.hashSync("123", 10)
  }
};


//starter page
app.get("/", (req,res) => {
  res.redirect("/u")
});

//index page
app.get("/u", (req, res) => {
  let cookiesID = req.session.user_id;
  if (cookiesID !== undefined) {
    const userURLs = urlsForUser(cookiesID, urlDatabase);
    let templateVars = { urls: userURLs, username: users[req.session.user_id] };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login")
  }
});

//creating userID and short link
app.post("/u", (req, res) => {
  let cookiesID = req.session.user_id;
  if (cookiesID === undefined) {
    res.render("urls_login", { username: req.session.user_id })
  } else {
    const shortURL = generateRandomString();
    const userURLs = urlsForUser(cookiesID, urlDatabase);
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL, userID: req.session.user_id };
    userURLs[shortURL] = urlDatabase[shortURL];
    res.redirect(`/u/`);
  }
});

//creating new short url
app.get("/u/new", (req, res) => {
  let cookiesID = req.session.user_id;
  if (cookiesID !== undefined) {
    let templateVars = { username: users[cookiesID] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//redirection to initial site longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    res.status(403);
    res.send('<h2>You don\'t have the right to update this URL or you enetered an incorrect URL<h2>');
  } else {
    res.redirect(longURL);
  }
});

//redirection to edit page
app.get("/u/:shortURL/update", (req, res) => {
  let cookiesID = req.session.user_id;
  if (cookiesID !== undefined) {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL].longURL;
    const templateVars = { longURL, shortURL, username: users[cookiesID]};
    res.render("urls_show", templateVars);
    } else {
    res.redirect("/login");
  }   
});

//adding edit option on urls_show.ejs
app.post("/u/:shortURL/update", (req, res) => {
  let cookiesID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userURLs = urlsForUser(cookiesID, urlDatabase);
  userURLs[shortURL].longURL = longURL;
  res.redirect(`/u/`)
});

// adding delete  to the urls_index
app.post("/u/:shortURL/delete", (req, res) => {
  let cookiesID = req.session.user_id;
  if (cookiesID !== undefined) {
    const del = req.params.shortURL;
    const userURLs = urlsForUser(cookiesID, urlDatabase);
    delete urlDatabase[del];
    res.redirect("/u");
  } else {
    res.redirect("/login");
  }
});



// adding register page
app.get("/register", (req, res) => {
  const templateVars = { username: req.session.user_id };
  res.render("urls_register", templateVars);
});

//adding logout feature in header
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/u/");
});

//adding handling registration form
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "" || checkEmail(users, email)) {
    res.status(404);
    res.send("Your email is registered already. Proceed to the login page, please.");
  } else {
    users[id] = { id, email, password: hashedPassword }
    req.session.user_id = id;
    res.redirect("/u")
  }
});

//adding login functionality
app.get("/login", (req, res) => {
  const templateVars = { username: req.session.user_id }
  res.render("urls_login", templateVars)
});

//adding login feature in header
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!checkEmail(users, email) || !bcrypt.compareSync(password, users[getID(email, users)].password)) {
    res.status(403);
    res.send("<h2>The email does not exist in our system or there is a wrong password.</h2>");
  } else if (users[getID(email, users)].email === req.body.email && bcrypt.compareSync(password, users[getID(email, users)].password)) {
    req.session.user_id = getID(email, users);
    res.redirect('/u');
  }
});

app.listen(PORT, () => {
  console.log(`Tiny app is listening on port ${PORT}!`);
});