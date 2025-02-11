const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin',
    database: 'dbmyapp'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Successfully connected to database');
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
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (results.length > 0) {
            res.json({ 
                success: true, 
                user: {
                    id: results[0].id,
                    username: results[0].username
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// Username endpoint
app.post('/api/user', (req, res) => {
    const { username, password } = req.body;
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    
    connection.query(query, [username, password], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error creating users' });
        }
        res.json({ id: result.insertId });
    });
});

// Products endpoints
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products WHERE state = "A"';
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching products' });
        }
        res.json(results);
    });
});

app.post('/api/products', (req, res) => {
    const { name, category, price, stock } = req.body;
    const query = 'INSERT INTO products (name, category, price, stock, state) VALUES (?, ?, ?, ?, "A")';
    
    connection.query(query, [name, category, price, stock], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error creating product' });
        }
        res.json({ id: result.insertId });
    });
});

app.put('/api/products/:id', (req, res) => {
    const { name, category, price, stock } = req.body;
    const query = 'UPDATE products SET name = ?, category = ?, price = ?, stock = ? WHERE id = ?';
    
    connection.query(query, [name, category, price, stock, req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error updating product' });
        }
        res.json({ success: true });
    });
});

app.get('/api/products/:id', (req, res) => {
    const query = 'SELECT * FROM products WHERE id = ? AND state = "A"';
    
    connection.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el producto' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(results[0]);
    });
});

app.delete('/api/products/:id', (req, res) => {
    const query = 'UPDATE products SET state = "I" WHERE id = ?';
    
    connection.query(query, [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error deleting product' });
        }
        res.json({ success: true });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
