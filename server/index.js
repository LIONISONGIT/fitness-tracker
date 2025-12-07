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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
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
app.get('/api/logs', getLogs);
app.get('/logs', getLogs);

// 2. POST /api/logs
// 2. POST /api/logs
const createLog = async (req, res) => {
    const { id, date, food, calories, protein, carbs, fats } = req.body;

    // Basic validation
    if (!food || !date) {
        return res.status(400).json({ error: 'Food and Date are required' });
    }

    try {
        const client = await pool.connect();
        const query = `
      INSERT INTO logs (id, date, food, calories, protein, carbs, fats)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const values = [
            String(id || Date.now()), // Ensure ID is string
            date,
            food,
            calories || 0,
            protein || 0,
            carbs || 0,
            fats || 0
        ];

        const result = await client.query(query, values);
        client.release();
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
app.post('/api/logs', createLog);
app.post('/logs', createLog);

// 3. DELETE /api/logs/:id
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
app.delete('/api/logs/:id', deleteLog);
app.delete('/logs/:id', deleteLog);

// 4. POST /api/analyze-food (Replaces Ollama)
// 4. POST /api/analyze-food
const analyzeFood = async (req, res) => {
    const { prompt } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        console.error("Missing GEMINI_API_KEY");
        return res.status(500).json({ error: "Server API Key not configured" });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt + " \n RESPONSE MUST BE STRICT JSON.");
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        res.json({ response: cleanText });

    } catch (err) {
        console.error("AI Error:", err);
        // Expose the error message to the client for debugging
        res.status(500).json({ error: "Failed to analyze food: " + err.message });
    }
};
app.post('/api/analyze-food', analyzeFood);
app.post('/analyze-food', analyzeFood);

// Health check
app.get('/', (req, res) => {
    res.send('Fitness Tracker API is running');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app; // Export for Vercel
