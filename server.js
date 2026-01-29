const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files (HTML, CSS, JS)

// Database Setup
const db = new sqlite3.Database('game.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        createTable();
    }
});

function createTable() {
    db.run(`CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        score INTEGER,
        difficulty TEXT,
        date TEXT
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela:', err.message);
        } else {
            console.log('Tabela scores pronta.');
        }
    });
}

// API Routes

// Get Top Scores (Leaderboard)
app.get('/api/scores', (req, res) => {
    const sql = `SELECT * FROM scores ORDER BY score DESC LIMIT 10`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Save Score
app.post('/api/scores', (req, res) => {
    const { name, score, difficulty } = req.body;
    const date = new Date().toISOString();

    if (!name || score === undefined) {
        res.status(400).json({ "error": "Nome e pontuação são obrigatórios" });
        return;
    }

    const sql = `INSERT INTO scores (name, score, difficulty, date) VALUES (?, ?, ?, ?)`;
    const params = [name, score, difficulty, date];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, name, score, difficulty, date }
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
