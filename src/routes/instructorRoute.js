// src/routes/courseRoutes.js
const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { addInstructor, getInstructors } = require('../controllers/courseController');

const router = express.Router();

router.post('/add', authenticateToken, addInstructor);
router.get('/', authenticateToken,authorizeRole(['admin']), getInstructors);

module.exports = router;
