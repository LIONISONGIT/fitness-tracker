const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug Middleware to log all requests
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});

// Auth Middleware
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    if (token !== "lion-secret-token") {
        return res.status(401).json({ error: "Invalid Token" });
    }
    next();
};

// Login Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "lion" && password === "lion36") {
        return res.json({ token: "lion-secret-token" });
    }
    return res.status(401).json({ error: "Invalid credentials" });
});
// Handle root login route too for robustness
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "lion" && password === "lion36") {
        return res.json({ token: "lion-secret-token" });
    }
    return res.status(401).json({ error: "Invalid credentials" });
});

// Database Connection
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize Database Table
const initDb = async () => {
    try {
        const client = await pool.connect();
        await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id VARCHAR(255) PRIMARY KEY,
        date VARCHAR(50),
        food TEXT,
        calories INTEGER,
        protein INTEGER,
        carbs INTEGER,
        fats INTEGER,
        water_ml INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS goals (
        id VARCHAR(255) PRIMARY KEY,
        date VARCHAR(50),
        text TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority VARCHAR(20) DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Migration for existing tables
      ALTER TABLE goals ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';
      ALTER TABLE logs ADD COLUMN IF NOT EXISTS water_ml INTEGER DEFAULT 0;

    `);
        client.release();
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initDb();

// Routes

// 1. GET /api/logs
const getLogs = async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM logs ORDER BY created_at DESC');
        console.log("Fetched logs:", result.rows.length);
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
app.get('/api/logs', authMiddleware, getLogs);
app.get('/logs', authMiddleware, getLogs);

// 2. POST /api/logs
const createLog = async (req, res) => {
    const { id, date, food, calories, protein, carbs, fats, water_ml } = req.body;

    // Basic validation
    if (!food || !date) {
        return res.status(400).json({ error: 'Food and Date are required' });
    }

    try {
        const client = await pool.connect();
        const query = `
      INSERT INTO logs (id, date, food, calories, protein, carbs, fats, water_ml)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
        const values = [
            String(id || Date.now()), // Ensure ID is string
            date,
            food,
            calories || 0,
            protein || 0,
            carbs || 0,
            fats || 0,
            water_ml || 0
        ];

        const result = await client.query(query, values);
        client.release();
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
app.post('/api/logs', authMiddleware, createLog);
app.post('/logs', authMiddleware, createLog);

// 3. DELETE /api/logs/:id
const deleteLog = async (req, res) => {
    const { id } = req.params;
    try {
        const client = await pool.connect();
        await client.query('DELETE FROM logs WHERE id = $1', [id]);
        client.release();
        res.json({ message: 'Log deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
app.delete('/api/logs/:id', authMiddleware, deleteLog);
app.delete('/logs/:id', authMiddleware, deleteLog);

// 4. POST /api/analyze-food
const analyzeFood = async (req, res) => {
    const { prompt } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        console.error("Missing GEMINI_API_KEY");
        return res.status(500).json({ error: "Server API Key not configured" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let attempts = 0;
    const maxAttempts = 5; // Increased to 5 to handle Free Tier (approx 60s coverage)
    let delay = 2000; // Start with 2 seconds

    while (attempts < maxAttempts) {
        try {
            const result = await model.generateContent(prompt + " \n RESPONSE MUST BE STRICT JSON.");
            const response = await result.response;
            const text = response.text();

            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return res.json({ response: cleanText });

        } catch (err) {
            console.error(`AI Error (Attempt ${attempts + 1}):`, err.message);

            // Check for Rate Limit (429) OR "Overloaded" errors
            if (err.message.includes("429") || err.message.includes("Too Many Requests") || err.message.includes("quota")) {
                attempts++;
                if (attempts >= maxAttempts) {
                    return res.status(429).json({ error: "Server is busy (Rate Limit). Please try again in a minute." });
                }

                // Smart Delay: If error message has a time, we could parse it, but simple exponential backoff is safer.
                // 2s -> 4s -> 8s -> 16s -> 32s (Total ~62s)
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else {
                return res.status(500).json({ error: "Failed to analyze food: " + err.message });
            }
        }
    }
};
app.post('/api/analyze-food', authMiddleware, analyzeFood);
app.post('/analyze-food', authMiddleware, analyzeFood);

// Health check
app.get('/', (req, res) => {
    res.send('Fitness Tracker API is running');
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app; // Export for Vercel
