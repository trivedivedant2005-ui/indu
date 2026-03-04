const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

// Role-based Access Middleware
const isClerk = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'clerk' || decoded.role === 'admin' || decoded.role === 'super_admin') {
            req.user = decoded;
            next();
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'photo') cb(null, 'uploads/photos/');
        else if (file.fieldname === 'pdf') cb(null, 'uploads/study_material/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (file.fieldname === 'photo' && !['.jpg', '.jpeg', '.png'].includes(ext)) {
            return cb(new Error('Only images are allowed'));
        }
        if (file.fieldname === 'pdf' && ext !== '.pdf') {
            return cb(new Error('Only PDFs are allowed'));
        }
        cb(null, true);
    }
});

// Update/Notice Route
router.post('/update', isClerk, async (req, res) => {
    const { title, content, category, date } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO updates (title, content, category, date, author) VALUES (?, ?, ?, ?, ?)',
            [title, content, category, date || new Date(), req.user.email]
        );
        res.json({ success: true, message: 'Update posted', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// File/Photo Upload Route
router.post('/upload-photo', isClerk, upload.single('photo'), async (req, res) => {
    const { title, category } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO gallery (title, image_url, category, uploaded_by) VALUES (?, ?, ?, ?)',
            [title, req.file.path, category, req.user.id]
        );
        res.json({ success: true, message: 'Photo uploaded', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Study Material Upload Route
router.post('/upload-material', isClerk, upload.single('pdf'), async (req, res) => {
    const { title, semester, subject } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO study_materials (title, semester, subject, file_url, uploaded_by) VALUES (?, ?, ?, ?, ?)',
            [title, semester, subject, req.file.path, req.user.id]
        );
        res.json({ success: true, message: 'Material uploaded', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get all uploads for management
router.get('/my-uploads', isClerk, async (req, res) => {
    try {
        const [notices] = await pool.query(
            'SELECT id, title, category, created_at, "notice" as type FROM updates WHERE author = ?',
            [req.user.email]
        );
        const [photos] = await pool.query(
            'SELECT id, title, category, image_url, created_at, "photo" as type FROM gallery WHERE uploaded_by = ?',
            [req.user.id]
        );
        const [materials] = await pool.query(
            'SELECT id, title, semester, subject, file_url, created_at, "material" as type FROM study_materials WHERE uploaded_by = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            data: {
                notices,
                photos,
                materials
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete Notice
router.delete('/notice/:id', isClerk, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM updates WHERE id = ? AND author = ?',
            [req.params.id, req.user.email]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Notice not found or unauthorized' });
        }
        res.json({ success: true, message: 'Notice deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete Photo
router.delete('/photo/:id', isClerk, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT image_url FROM gallery WHERE id = ? AND uploaded_by = ?', [req.params.id, req.user.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Photo not found' });

        const fileUrl = rows[0].image_url;
        const filePath = path.join(__dirname, '..', fileUrl);

        // Delete from DB first
        await pool.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);

        // Try to delete physical file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ success: true, message: 'Photo deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete Study Material
router.delete('/material/:id', isClerk, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT file_url FROM study_materials WHERE id = ? AND uploaded_by = ?', [req.params.id, req.user.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Material not found' });

        const fileUrl = rows[0].file_url;
        const filePath = path.join(__dirname, '..', fileUrl);

        // Delete from DB
        await pool.query('DELETE FROM study_materials WHERE id = ?', [req.params.id]);

        // Try to delete physical file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ success: true, message: 'Material deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
