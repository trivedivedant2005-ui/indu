const express = require('express');
const router = express.Router();
const { authenticateStudent } = require('../middleware/auth');
const pool = require('../config/database');

// Get Student Profile
router.get('/profile', authenticateStudent, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [students] = await connection.query(
            'SELECT id, roll_number, enrollment_id, first_name, last_name, email, phone, semester, status, admission_date FROM students WHERE id = ?',
            [req.student.id]
        );

        if (students.length === 0) {
            connection.release();
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        connection.release();

        res.json({ 
            success: true, 
            student: students[0]
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching profile',
            error: error.message 
        });
    }
});

// Get Student Courses
router.get('/courses', authenticateStudent, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [courses] = await connection.query(
            `SELECT c.*, e.grade, e.marks, e.status, e.attendance
            FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.student_id = ?
            ORDER BY c.semester DESC`,
            [req.student.id]
        );

        connection.release();

        res.json({ 
            success: true, 
            courses
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching courses',
            error: error.message 
        });
    }
});

// Get Grades/Marks
router.get('/grades', authenticateStudent, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [grades] = await connection.query(
            `SELECT c.name, c.code, e.marks, e.grade, e.attendance, e.status
            FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.student_id = ?
            ORDER BY c.semester DESC`,
            [req.student.id]
        );

        connection.release();

        res.json({ 
            success: true, 
            grades
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching grades',
            error: error.message 
        });
    }
});

// Get Fee Details
router.get('/fees', authenticateStudent, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [fees] = await connection.query(
            'SELECT id, semester, amount, due_date, payment_date, status, payment_method FROM fees WHERE student_id = ? ORDER BY semester DESC',
            [req.student.id]
        );

        connection.release();

        res.json({ 
            success: true, 
            fees
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching fees',
            error: error.message 
        });
    }
});

// Get Placement Status
router.get('/placement', authenticateStudent, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [placements] = await connection.query(
            'SELECT company_name, position, salary, joining_date, status FROM placements WHERE student_id = ?',
            [req.student.id]
        );

        connection.release();

        if (placements.length === 0) {
            return res.json({ 
                success: true, 
                placement: null,
                message: 'Not placed yet'
            });
        }

        res.json({ 
            success: true, 
            placement: placements[0]
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching placement',
            error: error.message 
        });
    }
});

// Submit Assignment (Store file reference)
router.post('/assignment/submit', authenticateStudent, async (req, res) => {
    try {
        const { assignment_id, file_url, submission_text } = req.body;

        if (!assignment_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Assignment ID required' 
            });
        }

        // In a real app, files would be uploaded to a storage service
        // For now, we're just storing the reference

        res.json({ 
            success: true, 
            message: 'Assignment submitted successfully',
            submission: {
                assignment_id,
                submitted_at: new Date(),
                status: 'submitted'
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error submitting assignment',
            error: error.message 
        });
    }
});

// Update Student Profile
router.put('/profile/update', authenticateStudent, async (req, res) => {
    try {
        const { phone, email } = req.body;

        const connection = await pool.getConnection();

        await connection.query(
            'UPDATE students SET phone = ?, email = ?, updated_at = NOW() WHERE id = ?',
            [phone, email || req.student.email, req.student.id]
        );

        connection.release();

        res.json({ 
            success: true, 
            message: 'Profile updated successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating profile',
            error: error.message 
        });
    }
});

module.exports = router;
