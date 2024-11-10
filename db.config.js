const mysql = require('mysql');

const dbConfig = {
    host: 'localhost', 
    user: 'root',
    password: '693369',
    database: 'recipedt' 
};

const db = mysql.createConnection(dbConfig);


db.connect((err) => { 
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database!'); 
});

module.exports = db;