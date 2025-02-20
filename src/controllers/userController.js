const db = require('../config/db');

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT users.id, users.name, users.email, 
                   users.created_at, users.role_id , users.gender_id 
            FROM users
            ORDER BY users.created_at DESC;
        `);
        

        res.status(200).json({ message: "Users fetched successfully", users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};