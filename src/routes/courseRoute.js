// src/routes/courseRoutes.js
const express = require('express');
const { createCourse, getCourses } = require('../controllers/courseController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authenticateToken,authorizeRole(['admin']), createCourse);
router.get('/', authenticateToken,getCourses);

module.exports = router;
