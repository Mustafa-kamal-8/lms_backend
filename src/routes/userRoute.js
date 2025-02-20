// src/routes/courseRoutes.js
const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { getUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/', authenticateToken,authorizeRole(['admin']), getUsers);

module.exports = router;
