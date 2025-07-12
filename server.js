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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Updated endpoint to get translation data based on your table structure
app.get('/api/translate', async (req, res) => {
    try {
        // Get all translated terms (is_untouched = false)
        const translatedTerms = await pool.query(`
            SELECT term_key, english, arabic, turkish 
            FROM manga_translations 
            WHERE is_untouched = FALSE
        `);
        
        // Get all untouched terms (is_untouched = true)
        const untouchedTerms = await pool.query(`
            SELECT term_key, english 
            FROM manga_translations 
            WHERE is_untouched = TRUE
        `);
        
        // Format the translated terms
        const translations = {};
        translatedTerms.rows.forEach(row => {
            translations[row.term_key] = {
                en: row.english,
                ar: row.arabic,
                tr: row.turkish
            };
        });
        
        const untouched = {};
        untouchedTerms.rows.forEach(row => {
            untouched[row.term_key] = row.english;
        });
        

        const languageCount = 3; 
        
        res.json({
            success: true,
            language_count: languageCount,
            data: {
                translations,
                untouched
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error fetching translation data'
        });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json(false);
    }
    
    try {
        const result = await pool.query(
            'SELECT 1 FROM users WHERE username = $1 AND password = $2', 
            [username, password]
        );
        
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