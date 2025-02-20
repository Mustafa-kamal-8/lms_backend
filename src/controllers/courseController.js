// src/controllers/courseController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');

exports.createCourse = async (req, res) => {
    const { course_name, course_code, created_by } = req.body;
    
    try {
        const [result] = await db.execute(
            'INSERT INTO courses (course_name, course_code, created_by) VALUES (?, ?, ?)',
            [course_name, course_code, created_by]
        );
        res.status(201).json({ message: 'Course Created Successfully', courseId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCourses = async (req, res) => {
    try {
        const [courses] = await db.execute(`
            SELECT courses.id, courses.course_name, courses.course_code, 
                   courses.created_by, courses.created_at
            FROM courses
            ORDER BY courses.created_at DESC;
        `);
        

        res.status(200).json({ message: "Courses fetched successfully", courses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.editCourse = async (req, res) => {
    const { courseId } = req.params;
    const { course_name, course_code } = req.body;
    const { role } = req.user;

    if (role !== 1) return res.status(403).json({ error: 'Unauthorized' });

    try {
        await db.execute(
            'UPDATE courses SET course_name = ?, course_code = ? WHERE id = ?',
            [course_name, course_code, courseId]
        );
        res.json({ message: 'Course Updated Successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    const { courseId } = req.params;
    const { role } = req.user;

    if (role !== 1) return res.status(403).json({ error: 'Unauthorized' });

    try {
        await db.execute('DELETE FROM courses WHERE id = ?', [courseId]);
        res.json({ message: 'Course Deleted Successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addInstructor = async (req, res) => {
    const { courseId, instructorId } = req.body;
 
   
    try {
        await db.execute(
            'INSERT INTO course_instructors (course_id, instructor_id) VALUES (?, ?)',
            [courseId, instructorId]
        );
        res.json({ message: 'Instructor Added Successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getInstructors = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                ci.id, 
                ci.course_id, 
                c.course_name, 
                ci.instructor_id, 
                u.name AS instructor_name, 
                ci.added_at
            FROM course_instructors ci
            JOIN courses c ON ci.course_id = c.id
            JOIN users u ON ci.instructor_id = u.id
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.removeInstructor = async (req, res) => {
    const { courseId, instructorId } = req.body;
    const { role } = req.user;

    if (role !== 1) return res.status(403).json({ error: 'Unauthorized' });

    try {
        await db.execute(
            'DELETE FROM course_instructors WHERE course_id = ? AND instructor_id = ?',
            [courseId, instructorId]
        );
        res.json({ message: 'Instructor Removed Successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.joinCourse = async (req, res) => {
    const { course_code } = req.body;
    const { id, role } = req.user;

    if (role !== 2) return res.status(403).json({ error: 'Unauthorized' });

    try {
        const [courses] = await db.execute('SELECT id FROM courses WHERE course_code = ?', [course_code]);
        if (courses.length === 0) return res.status(404).json({ error: 'Course Not Found' });

        const courseId = courses[0].id;
        await db.execute(
            'INSERT INTO course_instructors (course_id, instructor_id) VALUES (?, ?)',
            [courseId, id]
        );
        res.json({ message: 'Joined Course Successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.uploadTeachersExcel = async (req, res) => {
    upload.single('file')(req, res, async function (err) {
        if (err) {
            return res.status(500).json({ error: 'File upload failed' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const workbook = xlsx.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
            
            for (const row of data) {
                const { email, course_id } = row;
                const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
                if (users.length > 0) {
                    const instructor_id = users[0].id;
                    await db.execute(
                        'INSERT INTO course_instructors (course_id, instructor_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE course_id = VALUES(course_id)',
                        [course_id, instructor_id]
                    );
                }
            }
            
            fs.unlinkSync(req.file.path);
            res.json({ message: 'Teachers uploaded successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};
