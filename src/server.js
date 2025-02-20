// src/app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const authRoutes = require('./routes/authRoute');
const courseRoutes = require('./routes/courseRoute');
const masterRoute = require('./routes/masterRoute');
const userRoute = require('./routes/userRoute');
const instructorRoute = require('./routes/instructorRoute');
const noticeRoute = require('./routes/noticeRoute');
const { getDashboardStats } = require('./controllers/dashboardController');



const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/master', masterRoute);
app.use('/api/users', userRoute);
app.use('/api/instructor', instructorRoute);
app.use('/api/notice', noticeRoute);
app.use('/api/dashboard', getDashboardStats);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
