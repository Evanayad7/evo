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

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simplified login endpoint for Flutter
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Basic validation
    if (!username || !password) {
        return res.status(400).json(false);
    }
    
    try {
        const result = await pool.query(
            'SELECT 1 FROM users WHERE username = $1 AND password = $2', 
            [username, password]
        );
        
        // Return just true/false
        res.json(result.rows.length > 0);
    } catch (err) {
        console.error(err);
        res.status(500).json(false);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});