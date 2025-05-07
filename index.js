const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Use express.json() to parse JSON bodies
app.use(express.json());

// Serve static files (like the HTML page)
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to load users from file
const loadUsers = () => {
    try {
        const data = fs.readFileSync('users.json');
        return JSON.parse(data);
    } catch (err) {
        return []; // Return an empty array if the file doesn't exist yet
    }
};

// Helper function to save users to file
const saveUsers = (users) => {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
};

// Register route with more fields
app.post('/register', (req, res) => {
    const { name, email, password, age, bio } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send({ error: 'Name, email, and password are required' });
    }

    const users = loadUsers();
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).send({ error: 'User already exists' });
    }

    const newUser = { name, email, password, age, bio };
    users.push(newUser);

    // Save updated users to file
    saveUsers(users);

    res.status(201).send({
        message: 'User registered successfully',
        user: { name, email, age, bio } // Don't return the password for security
    });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const users = loadUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).send({ error: 'Invalid email or password' });
    }

    res.send({ message: `Welcome back, ${user.name}` });
});

// Start the server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
