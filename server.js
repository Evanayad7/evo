require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const zod = require('zod');
const app = express();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://evan:DsOABuXUQiQx02Vj1Ng7Tj9gdwAsVV6D@dpg-d1nvi5er433s73bdjjg0-a.frankfurt-postgres.render.com/test_m48n',
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/translate', async (req, res) => {
    try {
        const translatedTerms = await pool.query(`
            SELECT term_key, english, arabic, turkish 
            FROM manga_translations 
            WHERE is_untouched = FALSE
        `);
        
        const untouchedTerms = await pool.query(`
            SELECT term_key, english 
            FROM manga_translations 
            WHERE is_untouched = TRUE
        `);
        
        // Initialize the main translations object
        const translations = {
            search: {},
            peak_manga: {},
            categories: {
                title: {}, // This will hold the translation for "categories" word itself
                items: [] // This will hold the category items
            },
            s_tier: {
                title: {},
                items: []
            },
            latest_hit: {
                title: {},
                items: []
            }
        };
        
        // Process translated terms
        translatedTerms.rows.forEach(row => {
            const translation = {
                en: row.english,
                ar: row.arabic,
                tr: row.turkish
            };
            
            // Handle categories title and items separately
            if (row.term_key === 'categories') {
                translations.categories.title = translation;
            }
            else if (['fantasy', 'adventure', 'sports', 'magic','isekai'].includes(row.term_key)) {
                translations.categories.items.push({
                    [row.term_key]: translation
                });
            } 
            // Handle search and peak_manga normally
            else if (row.term_key === 'search' || row.term_key === 'peak_manga') {
                translations[row.term_key] = translation;
            }
            // Handle s_tier and latest_hit titles
            else if (row.term_key === 's_tier' || row.term_key === 'latest_hit') {
                translations[row.term_key].title = translation;
            }
        });
        
        // Process untouched terms
        const untouchedItems = [];
        untouchedTerms.rows.forEach(row => {
            untouchedItems.push({
                [row.term_key]: row.english
            });
        });
        
        // Add untouched items to both s_tier and latest_hit
        translations.s_tier.items = untouchedItems;
        translations.latest_hit.items = untouchedItems;
        
        const languageCount = 3;
        
        res.json({
            success: true,
            language_count: languageCount,
            data: {
                translations
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

    const loginSchema = zod.object({
        username: zod.string({ required_error: 'Username is required' }),
        password: zod.string()
    });
    
    let loginData

    try {
       loginData = loginSchema.parse(req.body);
    } catch (err) {
        console.error(err);
        return res.status(400).json(JSON.parse(err.message));
    }
    // const { username, password } = req.body;
    
    // if (!username || !password) {
    //     return res.status(400).json(false);
    // }
    
    try {
        const result = await pool.query(
            'SELECT 1 FROM users WHERE username = $1 AND password = $2', 
            [loginData.username, loginData.password]
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