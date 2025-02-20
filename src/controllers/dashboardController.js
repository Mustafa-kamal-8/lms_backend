const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const [[{ total_courses }]] = await db.execute(
            'SELECT COUNT(*) AS total_courses FROM courses'
        );

        const [[{ total_teachers }]] = await db.execute(`
            SELECT COUNT(*) AS total_teachers 
            FROM users 
            INNER JOIN role_master ON users.role_id = role_master.id 
            WHERE role_master.role_name = "instructor"
        `);

        const [[{ avg_teachers_per_course }]] = await db.execute(`
            SELECT COALESCE(AVG(teacher_count), 0) AS avg_teachers_per_course 
            FROM (
                SELECT COUNT(*) AS teacher_count 
                FROM course_instructors 
                GROUP BY course_id
            ) AS temp
        `);

        const [gender_split] = await db.execute(`
            SELECT gender_master.gender_name AS gender, COUNT(*) AS count 
            FROM users 
            INNER JOIN gender_master ON users.gender_id = gender_master.id 
            INNER JOIN role_master ON users.role_id = role_master.id 
            WHERE role_master.role_name = "instructor" 
            GROUP BY gender_master.gender_name
        `);

        const [[{ notice_viewership }]] = await db.execute(`
            SELECT COALESCE(
                (COUNT(DISTINCT user_id) / NULLIF(
                    (SELECT COUNT(*) FROM users 
                     INNER JOIN role_master ON users.role_id = role_master.id 
                     WHERE role_master.role_name = "instructor"
                    ), 0
                )) * 100, 0
            ) AS percentage FROM notice_views
        `);

        const [[{ notice_responses }]] = await db.execute(`
            SELECT COALESCE(
                (COUNT(DISTINCT user_id) / NULLIF(
                    (SELECT COUNT(*) FROM users 
                     INNER JOIN role_master ON users.role_id = role_master.id 
                     WHERE role_master.role_name = "instructor"
                    ), 0
                )) * 100, 0
            ) AS percentage FROM notice_responses
        `);

        const [[{ avg_lms_duration }]] = await db.execute(`
            SELECT COALESCE(AVG(duration), 0) AS avg_duration FROM lms_usage
        `);

        const [course_wise_notice_updates] = await db.execute(`
            SELECT course_id, COUNT(*) AS updates 
            FROM notices 
            GROUP BY course_id
        `);

        res.json({
            total_courses,
            total_teachers,
            avg_teachers_per_course,
            gender_split,
            notice_viewership,
            notice_responses,
            avg_lms_duration,
            course_wise_notice_updates
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
