
const db = require('../config/db');


exports.postNotice = async (req, res) => {
  const { courseId, message } = req.body;
  const { id } = req.user;
  const file = req.file; // Uploaded file


  try {
    // Check if a file was uploaded
    const filePath = file ? `uploads/${file.filename}` : null;

    await db.execute(
      "INSERT INTO notices (course_id, posted_by, message, file_path) VALUES (?, ?, ?, ?)",
      [courseId, id, message, filePath]
    );

    res.json({ message: "Notice Posted Successfully", filePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Instructor: View Notices
exports.viewNotices = async (req, res) => {
    const { courseId } = req.params;
    try {
        const [notices] = await db.execute('SELECT * FROM notices WHERE course_id = ?', [courseId]);
        res.json({ notices });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Instructor: Reply to Notice
exports.replyToNotice = async (req, res) => {
    const { noticeId, reply_message } = req.body;
    const { id } = req.user;

    try {
        await db.execute(
            'INSERT INTO notice_replies (notice_id, replied_by, reply_message) VALUES (?, ?, ?)',
            [noticeId, id, reply_message]
        );
        res.json({ message: 'Replied to Notice Successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getNotices = async (req, res) => {
  try {
    const instructorId = req.user.id;

    if (!instructorId) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    // Check if instructor is assigned to any course
    const [assignedCourses] = await db.execute(
      `SELECT course_id FROM course_instructors WHERE instructor_id = ?`,
      [instructorId]
    );

    // Check if instructor has posted any notices
    const [postedNotices] = await db.execute(
      `SELECT DISTINCT course_id FROM notices WHERE posted_by = ?`,
      [instructorId]
    );

    // If instructor is not found in either table, deny access
    if (assignedCourses.length === 0 && postedNotices.length === 0) {
      return res.status(403).json({ message: "Access denied. No relevant notices found." });
    }

    // Merge course IDs from both tables (to fetch notices)
    const courseIds = [
      ...new Set([...assignedCourses.map(c => c.course_id), ...postedNotices.map(n => n.course_id)])
    ];

    // Fetch notices for these courses or posted by the instructor
    const [notices] = await db.execute(
      `SELECT 
          notices.id AS notice_id,
          notices.message,
          notices.file_path,
          courses.course_name
       FROM notices
       JOIN courses ON notices.course_id = courses.id
       WHERE notices.course_id IN (?) OR notices.posted_by = ?`,
      [courseIds, instructorId]
    );

    res.status(200).json({ message: "Notices fetched successfully", notices });
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getNoticeReplies = async (req, res) => {
  const { noticeId } = req.body;

  if (!noticeId) {
      return res.status(400).json({ error: "noticeId is required" });
  }

  try {
      const [replies] = await db.execute(
          `SELECT nr.id, nr.notice_id, nr.reply_message, nr.replied_at, 
                  u.name AS replied_by_name 
           FROM notice_replies nr
           JOIN users u ON nr.replied_by = u.id
           WHERE nr.notice_id = ? 
           ORDER BY nr.replied_at DESC`,
          [noticeId]
      );

      res.json({
          message: "Replies fetched successfully",
          replies,
      });
  } catch (error) {
      console.error("Error fetching replies:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};
