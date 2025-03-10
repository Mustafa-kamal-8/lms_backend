const express = require("express");
const { postNotice, getNotices, replyToNotice, getNoticeReplies, getInstructorNotices } = require("../controllers/noticeController");
const upload = require("../middleware/multerMiddleware");
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/add",authenticateToken,authorizeRole(['admin']), upload.single("file"), postNotice);
router.get("/",authenticateToken,getNotices);
router.post("/reply",authenticateToken,replyToNotice);
router.post("/notice-reply",authenticateToken,getNoticeReplies);
router.get("/notice-instructor",authenticateToken,getInstructorNotices)

module.exports = router;
