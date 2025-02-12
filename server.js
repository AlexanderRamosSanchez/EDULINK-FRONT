const express = require('express');
const { Pool } = require('pg'); // Importar el cliente de PostgreSQL
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_rom7qCOTAev2@ep-spring-pond-a8sf4mo2-pooler.eastus2.azure.neon.tech/neondb?sslmode=require'
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const query = 'SELECT * FROM users WHERE username = $1 AND password = $2';
    
    try {
        const { rows } = await pool.query(query, [username, password]);
        if (rows.length > 0) {
            res.json({ 
                success: true, 
                user: {
                    id: rows[0].id,
                    username: rows[0].username
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Username endpoint
app.post('/api/user', async (req, res) => {
    const { username, password } = req.body;
    const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id';
    
    try {
        const { rows } = await pool.query(query, [username, password]);
        res.json({ id: rows[0].id });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating users' });
    }
});

// Products endpoints
app.get('/api/products', async (req, res) => {
    const query = 'SELECT * FROM products WHERE state = $1';
    try {
        const { rows } = await pool.query(query, ['A']);
        res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching products' });
    }
});

app.post('/api/products', async (req, res) => {
    const { name, category, price, stock } = req.body;
    const query = 'INSERT INTO products (name, category, price, stock, state) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    
    try {
        const { rows } = await pool.query(query, [name, category, price, stock, 'A']);
        res.json({ id: rows[0].id });
    } catch (err) {
        return res.status(500).json({ error: 'Error creating product' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { name, category, price, stock } = req.body;
    const query = 'UPDATE products SET name = $1, category = $2, price = $3, stock = $4 WHERE id = $5';
    
    try {
        await pool.query(query, [name, category, price, stock, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Error updating product' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const query = 'SELECT * FROM products WHERE id = $1 AND state = $2';
    
    try {
        const { rows } = await pool.query(query, [req.params.id, 'A']);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        return res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const query = 'UPDATE products SET state = $1 WHERE id = $2';
    
    try {
        await pool.query(query, ['I', req.params.id]);
        res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Error deleting product' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
