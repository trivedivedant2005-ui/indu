const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get Study Material Semester-wise
router.get('/:semester', async (req, res) => {
    const { semester } = req.params;
    try {
        const [materials] = await pool.query(
            'SELECT * FROM study_materials WHERE semester = ? ORDER BY created_at DESC',
            [semester]
        );
        res.json({ success: true, data: materials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
