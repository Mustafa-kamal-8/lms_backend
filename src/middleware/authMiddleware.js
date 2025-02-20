const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token after "Bearer"
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
        console.log( "user is" ,req.user);
    });
};



const roleMapping = {
    1: 'admin',
    2: 'instructor'
};

exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        console.log("User Role (before mapping):", req.user.role);

        const userRole = roleMapping[req.user.role]; // Convert role ID to role name
        console.log("Mapped Role:", userRole);

        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }
        next();
    };
};