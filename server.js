require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const app = express();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://evan:DsOABuXUQiQx02Vj1Ng7Tj9gdwAsVV6D@dpg-d1nvi5er433s73bdjjg0-a.frankfurt-postgres.render.com/test_m48n',
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

// New endpoint to get user credentials
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT username, password FROM users'
        );
        
        // Return just username and password for all users
        res.json({
            success: true,
            users: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
});

app.get('/', (req, res) => {
    res.render('index', { message: '' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const result = await pool.query(
            'SELECT username, password FROM users WHERE username = $1 AND password = $2', 
            [username, password]
        );
        
        if (result.rows.length > 0) {
            res.render('index', { message: 'Login successful!' });
        } else {
            res.render('index', { message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error(err);
        res.render('index', { message: 'Error during authentication' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});