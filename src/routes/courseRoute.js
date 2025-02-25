// src/routes/courseRoutes.js
const express = require('express');
const { createCourse, getCourses, uploadTeachersExcel, getCourseById, editCourse, deleteCourse } = require('../controllers/courseController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authenticateToken,authorizeRole(['admin']), createCourse);
router.get('/', authenticateToken,getCourses);
router.post('/bulk-upload', authenticateToken,authorizeRole(['admin']), uploadTeachersExcel);
router.post('/get-course-by-id', authenticateToken,authorizeRole(['admin']), getCourseById);
router.post('/edit-course',authenticateToken,authorizeRole(['admin']), editCourse)
router.post('/delete-course',authenticateToken,authorizeRole(['admin']), deleteCourse)

module.exports = router;
