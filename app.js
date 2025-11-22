// Initial app.js page to protect dashboard with a session-based login

const bcrypt = require('bcrypt'); // Hashing
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 5002; // The port the app is running on

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'mysecretkey', // Change for project
  resave: false,
  saveUninitialized: true
}));

// Serve static files (CSS, images)
app.use(express.static(path.join(__dirname)));

// In-memory users array
const users = [];

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
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.send('Invalid username or password. <a href="/login.html">Try again</a>');
  }

  try {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.loggedIn = true;
      req.session.user = user.username; // Track the logged-in user
      res.redirect('/index.html'); // Redirects to index (home)page
    } else {
      res.send('Invalid username or password. <a href="/login.html">Try again</a>');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Check if logged in
app.get('/session', (req, res) => {
  if (req.session.loggedIn) {
    res.json({ loggedIn: true, username: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Register routes
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Check passwords match
  if (password !== confirmPassword) {
    return res.send('Passwords do not match. <a href="/register.html">Try again</a>');
  }

  // Check for duplicate username
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.send('Username already taken. <a href="/register.html">Try again</a>');
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, email, password: hashedPassword });
    res.redirect('/login.html'); // Redirecting to log in page
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

