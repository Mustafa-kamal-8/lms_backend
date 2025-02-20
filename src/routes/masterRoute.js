// src/routes/courseRoutes.js
const express = require('express');
const {  getMasterData } = require('../controllers/masterController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getMasterData);

module.exports = router;
