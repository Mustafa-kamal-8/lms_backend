// src/routes/courseRoutes.js
const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', authenticateToken,authorizeRole(['admin']), getDashboardStats);

module.exports = router;
