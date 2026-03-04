const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const pool = require('../config/database');

// Get All Updates (Public)
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [updates] = await connection.query(
            `SELECT id, title, content, category, date, author, views FROM updates 
            WHERE is_published = TRUE 
            ORDER BY date DESC 
            LIMIT 20`
        );

        connection.release();

        res.json({ 
            success: true, 
            updates
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching updates',
            error: error.message 
        });
    }
});

// Get Update by Category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;

        const connection = await pool.getConnection();

        const [updates] = await connection.query(
            `SELECT id, title, content, category, date, author, views FROM updates 
            WHERE is_published = TRUE AND category = ? 
            ORDER BY date DESC`,
            [category]
        );

        connection.release();

        res.json({ 
            success: true, 
            updates
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching updates',
            error: error.message 
        });
    }
});

// Get Single Update
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();

        const [updates] = await connection.query(
            `SELECT * FROM updates WHERE id = ? AND is_published = TRUE`,
            [id]
        );

        if (updates.length === 0) {
            connection.release();
            return res.status(404).json({ 
                success: false, 
                message: 'Update not found' 
            });
        }

        // Increment views
        await connection.query(
            'UPDATE updates SET views = views + 1 WHERE id = ?',
            [id]
        );

        connection.release();

        res.json({ 
            success: true, 
            update: updates[0]
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching update',
            error: error.message 
        });
    }
});

// Create New Update (Admin only)
router.post('/create', authenticateAdmin, async (req, res) => {
    try {
        const { title, content, category, date, author } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title, content, and category required' 
            });
        }

        const connection = await pool.getConnection();

        const result = await connection.query(
            `INSERT INTO updates (title, content, category, date, author, is_published) 
            VALUES (?, ?, ?, ?, ?, TRUE)`,
            [title, content, category, date || new Date(), author || 'Admin']
        );

        connection.release();

        res.status(201).json({ 
            success: true, 
            message: 'Update created successfully',
            id: result[0].insertId
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error creating update',
            error: error.message 
        });
    }
});

// Update Existing Update (Admin only)
router.put('/:id/update', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, is_published } = req.body;

        const connection = await pool.getConnection();

        await connection.query(
            `UPDATE updates SET title = ?, content = ?, category = ?, is_published = ?, updated_at = NOW() 
            WHERE id = ?`,
            [title, content, category, is_published !== undefined ? is_published : true, id]
        );

        connection.release();

        res.json({ 
            success: true, 
            message: 'Update modified successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating',
            error: error.message 
        });
    }
});

// Delete Update (Admin only)
router.delete('/:id/delete', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();

        await connection.query('DELETE FROM updates WHERE id = ?', [id]);

        connection.release();

        res.json({ 
            success: true, 
            message: 'Update deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting update',
            error: error.message 
        });
    }
});

module.exports = router;
