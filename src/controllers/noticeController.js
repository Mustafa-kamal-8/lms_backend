
const db = require('../config/db');


exports.postNotice = async (req, res) => {
  const { courseId, message, instructorId } = req.body;
  const { id } = req.user;
  const file = req.file;

  console.log("Request Body:", req.body); // Debugging step

  // Check for undefined values
  if (!courseId || !message || !instructorId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const filePath = file ? `uploads/${file.filename}` : null;

    await db.execute(
      "INSERT INTO notices (course_id, posted_by, instructorId, message, file_path) VALUES (?, ?, ?, ?, ?)",
      [courseId, id, instructorId, message, filePath]
    );

    res.json({ message: "Notice Posted Successfully", filePath, instructorId });
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

exports.getInstructorNotices = async (req, res) => {
  try {
    const instructorId = req.user.id;

    if (!instructorId) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    // Check if instructor ID exists in the notices table
    const [notices] = await db.execute(
      `SELECT n.id AS notice_id, n.message, n.created_at, c.course_name 
       FROM notices n
       JOIN courses c ON n.course_id = c.id
       WHERE n.instructorId = ?`,
      [instructorId]
    );

    if (notices.length === 0) {
      return res.status(404).json({ message: "No notices found for this instructor." });
    }

    res.status(200).json({ message: "Notices fetched successfully", notices });
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getNotices = async (req, res) => {
  try {
    const instructorId = req.user.id;

    if (!instructorId) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    // Fetch courses assigned to the instructor
    const [assignedCourses] = await db.execute(
      `SELECT course_id FROM course_instructors WHERE instructor_id = ?`,
      [instructorId]
    );

    // Fetch notices posted by the instructor
    const [postedNotices] = await db.execute(
      `SELECT DISTINCT course_id FROM notices WHERE posted_by = ?`,
      [instructorId]
    );

    // Merge unique course IDs from both sources
    const courseIds = [
      ...new Set([...assignedCourses.map(c => c.course_id), ...postedNotices.map(n => n.course_id)]),
    ];

    // If the instructor has no relevant courses or notices, deny access
    if (courseIds.length === 0) {
      return res.status(403).json({ message: "Access denied. No relevant notices found." });
    }

    // Construct SQL query dynamically
    let query = `
      SELECT 
          notices.id AS notice_id,
          notices.message,
          notices.file_path,
          courses.course_name
      FROM notices
      JOIN courses ON notices.course_id = courses.id
      WHERE ${courseIds.length > 0 ? "notices.course_id IN (?) OR" : ""} notices.posted_by = ?
    `;

    const params = courseIds.length > 0 ? [courseIds, instructorId] : [instructorId];

    // Execute query
    const [notices] = await db.execute(query, params);

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
