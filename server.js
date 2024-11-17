const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const app = express();
const path = require('path');

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
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.post('/signup', (req, res) => {
    const { fullName, email, phoneNo, password } = req.body;
  
    // Hash the password (make sure you have bcrypt installed)
    bcrypt.hash(password, 10, (err, hash) => { 
      if (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Error creating account.');
        return;
      }
  
      const sql = `
        INSERT INTO Users (Username, Email, PhoneNo, Password) 
        VALUES (?, ?, ?, ?)
      `;
  
      db.query(sql, [fullName, email, phoneNo, hash], (err, result) => {
        if (err) {
          console.error('Error creating account:', err);
          res.status(500).send('Error creating account.');
          return;
        }
        console.log('Account created successfully!');
        res.status(200).send('Account created.'); 
      });
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

    const userNo = 1;

    db.query(sql, [recipeName, ingredients, procedure1, duration, image, userNo], (err, result) => {
        if (err) {
            console.error('Error saving recipe:', err);
            res.status(500).send('Error saving recipe.');
            return;
        }
        console.log('Recipe saved successfully!');
        res.status(200).send('Recipe received!');
    });
});

// Serve static files (including your HTML)
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
            res.status(500).send('Error fetching recipes.');
            return;
        }
        res.json(results);
    });
});
app.get('/recipe/:id', (req, res) => {
    const recipeId = req.params.id;
    const sql = `SELECT * FROM Recipe WHERE Recipe_No = ${recipeId}`;
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error fetching recipe:', err);
        res.status(500).send('Error fetching recipe.');
        return;
      }
      if (result.length === 0) {
        res.status(404).send('Recipe not found.'); // Send 404 if recipe not found
      } else {
        res.json(result[0]); // Send the recipe data as JSON
      }
    });
  });

app.listen(3100, () => {
    console.log('Server listening on port 3100');
});