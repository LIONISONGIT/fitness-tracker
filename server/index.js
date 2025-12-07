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
app.get('/api/logs', async (req, res) => {
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
});

// 2. POST /api/logs
app.post('/api/logs', async (req, res) => {
    const { id, date, food, calories, protein, carbs, fats } = req.body;

    // Basic validation
    if (!food || !date) {
        return res.status(400).json({ error: 'Food and Date are required' });
    }

    try {
        const client = await pool.connect();
        // Use the provided ID or generate one? The frontend provides ID mostly.
        // Ensure we handle defaults if 0s are passed
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
});

// 3. DELETE /api/logs/:id
app.delete('/api/logs/:id', async (req, res) => {
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
});

// 4. POST /api/analyze-food (Replaces Ollama)
app.post('/api/analyze-food', async (req, res) => {
    const { prompt } = req.body; // Expecting the raw text or the prompt from frontend

    // If the frontend sends the full prompt structure, we parse it. 
    // Or we just take the food text.
    // The frontend currently sends: { model: 'mistral', prompt: "...", stream: false, format: 'json' }
    // We can just grab 'prompt'.

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Server API Key not configured" });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // We can just forward the prompt, but Gemini behaves better if we handle structure here.
        // However, to minimize frontend changes, let's just use the prompt string from the body.

        // Safety: The frontend prompt is "You are a nutritionist... Input: 'food'".
        // Gemini handles this well.

        const result = await model.generateContent(prompt + " \n RESPONSE MUST BE STRICT JSON.");
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks ```json ... ```
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // The frontend expects: { response: "stringified json" } because Ollama returns that in 'response' field sometimes? 
        // Wait, let's check frontend code.
        // Frontend: const data = await response.json(); const result = JSON.parse(data.response);
        // So we must return { response: string_of_json }

        res.json({ response: cleanText });

    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ error: "Failed to analyze food" });
    }
});

// Health check
app.get('/', (req, res) => {
    res.send('Fitness Tracker API is running');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app; // Export for Vercel
