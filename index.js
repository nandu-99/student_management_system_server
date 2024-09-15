const express = require('express');
const dotenv = require("dotenv");
dotenv.config();
const cors = require('cors');
const {connectDB} = require('./config/db');
const {
  createUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  createLeaveRequest,
  getLeaveRequests,
  deleteLeaveRequest,
  getLeaveRequestsSummary,
  createContests,
  getContests,
  deleteContest,
  getLeavesByAdminSchool,
  approveOrRejectLeave,
  createEvents,
  getEvents
} = require('./controllers/userController');
const { verifyToken, checkRole } = require('./middlewares/authMiddleware');

const app = express();
app.use(express.json());
app.use(cors());

//auth
app.post('/signup', createUser);
app.post('/login', loginUser);
app.post('/logout', logoutUser);

//profile
app.get('/profile', verifyToken, getProfile);
app.put('/profile/update', verifyToken, updateProfile)

//leaves 
app.post('/leave-request', verifyToken, createLeaveRequest)
app.get('/leave-requests', verifyToken, getLeaveRequests)
app.delete('/leave-requests/:leaveRequestId',verifyToken, deleteLeaveRequest);
app.get('/leave-requests/summary', verifyToken, getLeaveRequestsSummary);

//contests 
app.post('/add-contests', verifyToken, createContests)
app.get('/contests', verifyToken, getContests)
app.delete('/contests/:id', deleteContest)

//admin 
app.get('/admin/school-leaves', verifyToken, checkRole('admin'), getLeavesByAdminSchool);
app.post('/leave-request/approve-reject', verifyToken, checkRole('admin'), approveOrRejectLeave);

//UpcomingHolidays 
app.post('/events', verifyToken, createEvents);
app.get('/events', verifyToken, getEvents);



const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
