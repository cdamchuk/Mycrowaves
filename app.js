// Initial app.js page to protect dashboard with a session based login

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 5002; // You can change this if you want

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'mysecretkey', // change this for your project
  resave: false,
  saveUninitialized: true
}));

// Serve static files (CSS, images)
app.use(express.static(path.join(__dirname)));

// Dummy user for login
const user = {
  username: 'chloe',
  password: 'password123' // plaintext for demo purposes
};

// Middleware to protect routes
function authMiddleware(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === user.username && password === user.password) {
    req.session.loggedIn = true;
    res.redirect('/dashboard');
  } else {
    res.send('Invalid credentials. <a href="/login.html">Try again</a>');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
