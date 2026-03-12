const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();
const port = 3000;

app.use(cors({
    origin: "localhost",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

/*
Used for testing local HTML files. Likely remove before publishing.
*/
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, "testSites")));


app.get('/', (req, res) => {
    res.send("Hello world! My first NodeJS Express app.")
});
app.get('/status', (req, res) => {
    const output = {
        message: "testing",
        ok: true
    };
    
    res.json(output);
});

/*
Gets all comments for the specified page_url.
*/
app.get('/comments', async (req, res) => {
    try{
        const { page_url } = req.query;

        const result = await pool.query(
            //'SELECT * FROM comments',
            `SELECT * FROM comments WHERE page_url = $1`,
            [page_url]
        );

        // console.log(result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error("GET /comments:", err);
        res.status(500).send("Server error");
    }
});

/*
Saves comment box info to database.
*/
app.post('/comments', async (req, res) => {
    try{
        const { 
            page_url,
            dom_path,
            selected_text,
            comment_text,
            pos_x,
            pos_y,
            author_id
        } = req.body;

        const result = await pool.query(
            `INSERT INTO comments
            (page_url, dom_path, selected_text, comment_text, pos_x, pos_y, author_id)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *`,
            [page_url, dom_path, selected_text, comment_text, pos_x, pos_y, author_id]
        );

        console.log(result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("POST /comments:", err);
        res.status(500).send("Server error");
    }
});

/*
Deletes comment box from database. 
*/
app.delete("/comments/:id", async (req, res) => {
    try{
        const result = await pool.query(
            "DELETE FROM comments WHERE id=$1",
            [req.params.id]
        )

        if (result.rowCount === 0){
            return res.status(404).send("Not found");
        }
        res.send("Deleted");
    } catch (err){
        console.error("DELETE /comments/:id", err);
        res.status(500).send("Server error");
    }
});

/*
Initializes 'comments' table in database if does not already exist.
*/
async function initDB() {
    await pool.query(`
        CREATE TABLE IF NOT exists comments (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            page_url TEXT NOT NULL,
            dom_path TEXT,
            selected_text TEXT,
            comment_text TEXT NOT NULL,
            pos_x INTEGER,
            pos_y INTEGER,
            author_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) 
    `);
    console.log("Database ready");
}

initDB().then(() => {
    // Starts the server
    app.listen(port, /* '0.0.0.0', */ () => console.log(`Server is running on port ${port}`))
});
