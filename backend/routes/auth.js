const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { logAuthEvent } = require('../utils/authLogger');

// Student Registration
router.post('/register', async (req, res) => {
    try {
        const { roll_number, enrollment_id, first_name, last_name, email, phone, password } = req.body;

        // Validate input
        if (!roll_number || !enrollment_id || !first_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const connection = await pool.getConnection();

        // Check if student already exists
        const [existingStudent] = await connection.query(
            'SELECT id FROM students WHERE roll_number = ? OR email = ?',
            [roll_number, email]
        );

        if (existingStudent.length > 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: 'Student already exists with this roll number or email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert student
        await connection.query(
            `INSERT INTO students 
            (roll_number, enrollment_id, first_name, last_name, email, phone, password, admission_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [roll_number, enrollment_id, first_name, last_name, email, phone, hashedPassword]
        );

        // Log registration event
        logAuthEvent({
            event: 'register',
            roll_number,
            email,
            ip: req.ip
        });

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Student registered successfully'
        });
    } catch (error) {
        console.error('Registration Database Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering student',
            error: error.message
        });
    }
});

// Student Login
router.post('/login', async (req, res) => {
    try {
        const { roll_number, password } = req.body;

        if (!roll_number || !password) {
            return res.status(400).json({
                success: false,
                message: 'Roll number and password required'
            });
        }

        const connection = await pool.getConnection();

        const [students] = await connection.query(
            'SELECT * FROM students WHERE roll_number = ?',
            [roll_number]
        );

        if (students.length === 0) {
            connection.release();
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const student = students[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, student.password);

        if (!isPasswordValid) {
            connection.release();
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Log login event
        logAuthEvent({
            event: 'login',
            roll_number: student.roll_number,
            email: student.email,
            ip: req.ip
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                id: student.id,
                roll_number: student.roll_number,
                email: student.email,
                type: 'student'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        connection.release();

        res.json({
            success: true,
            message: 'Login successful',
            token,
            student: {
                id: student.id,
                roll_number: student.roll_number,
                name: `${student.first_name} ${student.last_name}`,
                email: student.email,
                semester: student.semester
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
});

// Admin Signup (for first-time setup only)
router.post('/admin/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Admin signup should be restricted (check environment variable or hardcoded check)
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const connection = await pool.getConnection();

        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.query(
            'INSERT INTO admins (email, password, name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name, 'super_admin']
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating admin account',
            error: error.message
        });
    }
});

// Admin Login (email only, no password check)
router.post('/admin/login', async (req, res) => {
    try {
        const { email } = req.body;
        const trimmedEmail = email ? email.trim() : '';

        if (!trimmedEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email required'
            });
        }

        const connection = await pool.getConnection();

        const [admins] = await connection.query(
            'SELECT * FROM admins WHERE email = ? AND is_active = TRUE',
            [trimmedEmail]
        );

        if (admins.length === 0) {
            connection.release();
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const admin = admins[0];

        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                type: admin.role === 'clerk' ? 'clerk' : 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        connection.release();

        res.json({
            success: true,
            message: 'Admin login successful',
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
});

// Role checking middleware
const isSuperAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'super_admin') {
            req.user = decoded;
            next();
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized. Super Admin only.' });
        }
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// List all clerks
router.get('/admin/clerks', isSuperAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [clerks] = await connection.query(
            'SELECT id, email, name, role, is_active, created_at FROM admins WHERE role = "clerk"'
        );
        connection.release();
        res.json({ success: true, data: clerks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete Clerk
router.delete('/admin/clerk/:id', isSuperAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM admins WHERE id = ? AND role = "clerk"', [req.params.id]);
        connection.release();
        res.json({ success: true, message: 'Clerk account deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
