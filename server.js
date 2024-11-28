const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

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
  const { fullName, email, phoneNo, password, gender } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Error creating account.');
    }

    const sql = `
      INSERT INTO Users (Username, Email, PhoneNo, Password, Gender, isAPIUser, apiKey) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [fullName, email, phoneNo, hash, gender, 0, null], (err, result) => {
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
      res.clearCookie('userNo');
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
  const category = req.body.category;

  const sql = `
    INSERT INTO recipe (Recipe_Name, Ingredients, Procedure1, Duration, Image, Category, User_No)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const userNo = req.session.userNo;

  db.query(sql, [recipeName, ingredients, procedure1, duration, image, category, userNo], (err, result) => {
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

// API signup route
app.post('/api/signup', (req, res) => {
  const { fullName, email, phoneNo, password, gender } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Error creating API user.');
    }

    const apiKey = uuidv4();

    const sql = `
      INSERT INTO Users (Username, Email, PhoneNo, Password, Gender, isAPIUser, apiKey) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [fullName, email, phoneNo, hash, gender, 1, apiKey], (err, result) => {
      if (err) {
        console.error('Error creating API user:', err);
        return res.status(500).send('Error creating API user.');
      }
      console.log('API user created successfully!');

      const expiresIn = 3600;
      const token = jwt.sign({ userId: result.insertId }, 'your_jwt_secret', { expiresIn });

      return res.status(200).json({
        message: 'API user created.',
        apiKey: apiKey,
        token: token,
        expiresIn: expiresIn
      });
    });
  });
});

// Middleware to authenticate API users
function authenticateAPIUser(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).send('API key required.');
  }

  const sql = `SELECT * FROM Users WHERE apiKey = ?`;

  db.query(sql, [apiKey], (err, result) => {
    if (err) {
      console.error('Error fetching API user:', err);
      return res.status(500).send('Authentication failed.');
    }

    if (result.length === 0) {
      return res.status(401).send('Invalid API key.');
    }

    next();
  });
}

// API endpoint to get all users (secure)
app.get('/users', authenticateAPIUser, (req, res) => {
  const sql = "SELECT User_No, Username, Email, PhoneNo, Gender FROM Users";

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Error fetching users.');
    }
    return res.json(results);
  });
});

// API endpoint to get one user's details by ID (secure)
app.get('/users/:id', authenticateAPIUser, (req, res) => {
  const userId = req.params.id;
  const sql = `SELECT User_No, Username, Email, PhoneNo, Gender FROM Users WHERE User_No = ${userId}`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error fetching user.');
    }
    if (result.length === 0) {
      return res.status(404).send('User not found.');
    }
    return res.json(result[0]);
  });
});

// API endpoint to get one user's details by email (secure)
app.get('/users/email/:email', authenticateAPIUser, (req, res) => {
  const email = req.params.email;
  const sql = `SELECT User_No, Username, Email, PhoneNo, Gender FROM Users WHERE Email = ?`;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error fetching user.');
    }
    if (result.length === 0) {
      return res.status(404).send('User not found.');
    }
    return res.json(result[0]);
  });
});

// API endpoint to get all users by gender (secure)
app.get('/users/gender/:gender', authenticateAPIUser, (req, res) => {
  const gender = req.params.gender;
  const sql = `SELECT User_No, Username, Email, PhoneNo, Gender FROM Users WHERE Gender = ?`;

  db.query(sql, [gender], (err, result) => {
    if (err) {
      console.error('Error fetching users by gender:', err);
      return res.status(500).send('Error fetching users.');
    }
    return res.json(result);
  });
});

// API endpoint to get all recipes
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

// API endpoint to get recipe information by ID
app.get('/recipes/:id', (req, res) => {
  const recipeId = req.params.id;
  const sql = `SELECT * FROM recipe WHERE Recipe_No = ${recipeId}`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching recipe:', err);
      return res.status(500).send('Error fetching recipe.');
    }
    if (result.length === 0) {
      return res.status(404).send('Recipe not found.');
    }
    return res.json(result[0]);
  });
});

// API endpoint to get all recipes by category
app.get('/recipes/category/:category', (req, res) => {
  const category = req.params.category;
  const sql = `SELECT * FROM recipe WHERE Category = ?`;

  db.query(sql, [category], (err, result) => {
    if (err) {
      console.error('Error fetching recipes by category:', err);
      return res.status(500).send('Error fetching recipes.');
    }
    return res.json(result);
  });
});
app.get('/recipes/user/:userId', authenticateAPIUser, (req, res) => {
  const userId = req.params.userId;
  const sql = `SELECT * FROM recipe WHERE User_No = ${userId}`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching recipes by user:', err);
      return res.status(500).send('Error fetching recipes.');
    }
    return res.json(result);
  });
});


app.get('/signin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'signin.html'));
});

app.listen(3100, () => {
  console.log('Server listening on port 3100');
});