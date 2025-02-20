const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

exports.register = async (req, res) => {
    const { name, email, password, role_id, gender_id } = req.body;

    try {
        // Check if user already exists
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        console.log("Existing User Query Result:", existingUsers);  // Debugging log

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const [insertResult] = await db.query(
            'INSERT INTO users (name, email, password, role_id, gender_id) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role_id, gender_id]
        );

        console.log("Insert Query Result:", insertResult);  // Debugging log

        if (insertResult.insertId) {
            return res.status(201).json({ message: 'User registered successfully', userId: insertResult.insertId });
        } else {
            throw new Error("Failed to register user");
        }

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};



exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Retrieve user from the database
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token, user });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
