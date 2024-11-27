const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const db = require('./db.config');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Sign up route
app.post('/signup', (req, res) => {
  const { fullName, email, phoneNo, password } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Error creating account.');
    }

    const sql = `
      INSERT INTO Users (Username, Email, PhoneNo, Password) 
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [fullName, email, phoneNo, hash], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          if (err.sqlMessage.includes('key \'users.Username\'')) {
            return res.status(400).send('Username already exists. Please choose a different username.');
          } else if (err.sqlMessage.includes('key \'users.Email\'')) {
            return res.status(400).send('Email already exists. Please use a different email.');
          } else {
            return res.status(500).send('Error creating account.');
          }
        } else {
          console.error('Error creating account:', err);
          return res.status(500).send('Error creating account.');
        }
      }
      console.log('Account created successfully!');
      res.redirect('/signin.html?message=Account created successfully!');
    });
  });
});

// Sign in route
app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM Users WHERE Email = ?`;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error('Error during sign in:', err);
      return res.status(500).send('Error during sign in.');
    }

    if (result.length === 0) {
      return res.status(401).send('Invalid email or password.');
    }

    const user = result[0];
    bcrypt.compare(password, user.Password, (err, match) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Error during sign in.');
      }

      if (match) {
        console.log('Sign in successful!');
        req.session.userNo = user.User_No;
        res.cookie('userNo', user.User_No);
        return res.redirect('/index.html');
      } else {
        return res.status(401).send('Invalid email or password.');
      }
    });
  });
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Logout failed');
    } else {
      res.clearCookie('userNo'); // Clear the cookie
      return res.send('Logout successful');
    }
  });
});

app.post('/recipe', upload.single('image'), (req, res) => {
  const recipeName = req.body.recipe_name;
  const ingredients = req.body.ingredients;
  const procedure1 = req.body.procedure1;
  const duration = req.body.duration;
  const image = req.file ? req.file.filename : null;

  const sql = `
        INSERT INTO Recipe (Recipe_Name, Ingredients, Procedure1, Duration, Image, User_No) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  const userNo = req.session.userNo;

  db.query(sql, [recipeName, ingredients, procedure1, duration, image, userNo], (err, result) => {
    if (err) {
      console.error('Error saving recipe:', err);
      return res.status(500).send('Error saving recipe.');
    }
    console.log('Recipe saved successfully!');
    return res.status(200).send('Recipe received!');
  });
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Handle CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Route to get all recipes
app.get('/recipes', (req, res) => {
  const sql = "SELECT * FROM recipe";
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching recipes:', err);
      return res.status(500).send('Error fetching recipes.');
    }
    return res.json(results);
  });
});

// Route to get a single recipe by ID
app.get('/recipe/:id', (req, res) => {
  const recipeId = req.params.id;
  const sql = `SELECT * FROM Recipe WHERE Recipe_No = ${recipeId}`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching recipe:', err);
      return res.status(500).json({ error: 'Failed to fetch recipe.' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Recipe not found.' });
    } else {
      return res.json(result[0]);
    }
  });
});

app.get('/signin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'signin.html'));
});

app.listen(3100, () => {
  console.log('Server listening on port 3100');
});