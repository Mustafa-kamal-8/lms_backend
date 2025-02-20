const db = require('../config/db');

exports.getMasterData = async (req, res) => {
    try {
        // Fetch roles from the role_master table
        const [roles] = await db.execute('SELECT id, role_name AS name FROM role_master');

        // Fetch genders from the gender_master table
        const [genders] = await db.execute('SELECT id, gender_name AS name FROM gender_master');

        res.json({
            roles,
            genders
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
