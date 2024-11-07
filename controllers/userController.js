const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { prismaClient } = require('../config/db');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware'); 
const { formatISO, isValid } = require('date-fns');
const nodemailer = require('nodemailer');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  serure: false,
  auth: {
    user: 'vivekananda.99666@gmail.com', 
    pass: 'cjtc nfqp tkdq zqqd'  
  }
});

const createUser = async (req, res) => {
  const { name, email, password: pass, role } = req.body;
  const password = await bcrypt.hash(pass, 10);

  try {
    let existingUser;
    let newUser;

    switch (role) {
      case 'student':
        existingUser = await prismaClient.student?.findUnique({
          where: { email: email },
        });
        if (existingUser) {
          return res.status(400).json({ error: 'Student already exists' });
        }
        newUser = await prismaClient.student.create({
          data: { name, email, password, role },
        });
        break;

      case 'admin':
        newUser = await prismaClient.admin.create({
          data: { name, email, password, role },
        });
        break;

      case 'teacher':
        existingUser = await prismaClient.teacher?.findUnique({
          where: { email: email },
        });
        if (existingUser) {
          return res.status(400).json({ error: 'Teacher already exists' });
        }
        newUser = await prismaClient.teacher.create({
          data: { name, email, password, role },
        });
        break;

      default:
        return res.status(400).json({ error: 'Invalid role' });
    }
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    let user;
    switch (role) {
      case 'student':
        user = await prismaClient.student.findUnique({ where: { email: email } });
        break;
      case 'admin':
        user = await prismaClient.admin.findUnique({ where: { email: email } });
        break;
      case 'teacher':
        user = await prismaClient.teacher.findUnique({ where: { email: email } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid role' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User Not Found' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Wrong password' });
    }
    const token = jwt.sign({ id: user.id, role: role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, {
      httpOnly: false,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: '',
    });
    res.status(200).json({ message: 'Login successful', token: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logoutUser = (req, res) => {
  try {
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

const getProfile = async (req, res) => {
  const { id, role } = req.user;  
  try {
    let user;
    switch (role) {
      case 'student':
        user = await prismaClient.student.findUnique({ where: { id: id } });
        break;
      case 'admin':
        user = await prismaClient.admin.findUnique({ where: { id: id } });
        break;
      case 'teacher':
        user = await prismaClient.teacher.findUnique({ where: { id: id } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid role' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, createdAt, ...userData } = user;
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  const { id, role } = req.user; 
  const { 
    name, email, password, enrollmentId, dob, contactNumber, address,
    parentName, parentContact, school, profile_image 
  } = req.body; 
  try {
    let user;
    switch (role) {
      case 'student':
        user = await prismaClient.student.findUnique({ where: { id: id } });
        break;
      case 'admin':
        user = await prismaClient.admin.findUnique({ where: { id: id } });
        break;
      case 'teacher':
        user = await prismaClient.teacher.findUnique({ where: { id: id } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid role' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (password) updatedData.password = await bcrypt.hash(password, 10); 
    if (enrollmentId) updatedData.enrollmentId = enrollmentId;
    if (dob) updatedData.dob = dob;
    if (contactNumber) updatedData.contactNumber = contactNumber;
    if (address) updatedData.address = address;
    if (parentName) updatedData.parentName = parentName;
    if (parentContact) updatedData.parentContact = parentContact;
    if (school) updatedData.school = school;
    if (profile_image) updatedData.profile_image = profile_image;
    let updatedUser;
    switch (role) {
      case 'student':
        updatedUser = await prismaClient.student.update({
          where: { id: id },
          data: updatedData,
        });
        break;
      case 'admin':
        updatedUser = await prismaClient.admin.update({
          where: { id: id },
          data: updatedData,
        });
        break;
      case 'teacher':
        updatedUser = await prismaClient.teacher.update({
          where: { id: id },
          data: updatedData,
        });
        break;
    }
    const { password: pwd, createdAt, ...userData } = updatedUser;
    res.status(200).json({ message: 'Profile updated successfully', data: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const createLeaveRequest = async (req, res) => {
    const { leave_type, start_date, end_date, reason, file } = req.body;
    const { id, role } = req.user; 
    if (!isValid(new Date(start_date)) || !isValid(new Date(end_date))) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'End date cannot be earlier than start date' });
    }
    const formattedStartDate = formatISO(new Date(start_date));
    const formattedEndDate = formatISO(new Date(end_date));
    try {
      const leaveRequest = await prismaClient.leaveRequest.create({
        data: {
          userId: id,
          leaveType: leave_type,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          reason: reason,
          file: file || null,
          status: "Pending"
        },
      });
      res.status(201).json({ message: 'Leave request created successfully', leaveRequest });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
};

const getLeaveRequests = async (req, res) => {
  const { id } = req.user;  

  try {
    const leaveRequests = await prismaClient.leaveRequest.findMany({
      where: { userId: id },
    });

    if (leaveRequests.length === 0) {
      return res.status(404).json({ message: 'No leave requests found for this user' });
    }

    res.status(200).json({ leaveRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteLeaveRequest = async (req, res) => {
  const { id: userId } = req.user;
  const { leaveRequestId } = req.params;
  try {
    const leaveRequest = await prismaClient.leaveRequest.findFirst({
      where: {
        id: parseInt(leaveRequestId),
        userId: userId,
      },
    });
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found or not authorized' });
    }
    await prismaClient.leaveRequest.delete({
      where: { id: parseInt(leaveRequestId) },
    });
    res.status(200).json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getLeaveRequestsSummary = async (req, res) => {
  const { id } = req.user; 
  try {
    // Fetch the 10 most recent leave requests, regardless of status
    const recentLeaveRequests = await prismaClient.leaveRequest.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Fetch the 10 most recent completed leave requests
    const recentCompletedLeaveRequests = await prismaClient.leaveRequest.findMany({
      where: { userId: id, status: 'approved' },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.status(200).json({
      recentLeaveRequests,
      recentCompletedLeaveRequests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const createContests = async (req, res) => {
  const { id } = req.user;
  try {
    const contests = req.body;

    // Parse and format dates and weightages
    const formattedContests = contests.map((contest) => {
      if (contest.weightage && contest.weightage.includes('%')) {
        contest.weightage = parseFloat(contest.weightage.replace('%', '')) / 100;
      } else {
        contest.weightage = 0;  // Default value for empty weightage
      }

      // Convert date to Date object, handle ranges if present
      const [startDate, endDate] = contest.date.split(' to ');
      const start = new Date(startDate.trim());
      const end = endDate ? new Date(endDate.trim()) : null;

      return {
        ...contest,
        date: start, // If you only want to store the start date
        endDate: end, // If you want to store end date separately
      };
    });

    // Insert into the database
    const createdContests = await Promise.all(
      formattedContests.map(async (contest) => {
        return prismaClient.contest.create({
          data: {
            name: contest.contest_type,
            course: contest.course,
            weightage: contest.weightage,
            date: contest.date,
            endDate: contest.endDate, // Store end date if necessary
            school: 'Newton School of Technology'
          }
        });
      })
    );

    res.status(201).json({ message: 'Contests created successfully', createdContests });
  } catch (error) {
    console.error('Error creating contests:', error);
    res.status(500).json({ message: 'Error creating contests', error });
  }
}

const getContests = async (req, res) => {
  try {
    const contests = await prismaClient.contest.findMany();
    res.status(200).json(contests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching contests', error });
  }
}

const deleteContest = async (req, res) => {
  const { id } = req.params; // Get the contest ID from the request parameters

  try {
    // Find the contest to ensure it exists
    const contest = await prismaClient.contest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Delete the contest
    await prismaClient.contest.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Contest deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting contest', error });
  }
};

const getLeavesByAdminSchool = async (req, res) => {
  const { id: adminId } = req.user;

  try {
    // Find the admin and get the school they are associated with
    const admin = await prismaClient.admin.findUnique({ where: { id: adminId } });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const adminSchool = admin.school;

    // Fetch all leave requests
    const leaveRequests = await prismaClient.leaveRequest.findMany();

    // Extract user IDs from leave requests
    const userIds = leaveRequests.map(request => request.userId);

    // Fetch student information for these user IDs
    const students = await prismaClient.student.findMany({
      where: {
        id: { in: userIds }
      }
    });

    // Create a mapping of user ID to student details
    const studentDetails = students.reduce((acc, student) => {
      acc[student.id] = {
        enrollmentNumber: student.enrollmentId,
        name: student.name,
        school: student.school
      };
      return acc;
    }, {});

    // Filter leave requests based on the admin's school and include student details
    const filteredLeaveRequests = leaveRequests
      .map(request => {
        const student = studentDetails[request.userId];
        if (student && student.school === adminSchool) {
          return {
            ...request,
            enrollmentNumber: student.enrollmentNumber,
            studentName: student.name
          };
        }
        return null;
      })
      .filter(request => request !== null);

    if (filteredLeaveRequests.length === 0) {
      return res.status(404).json({ message: 'No leave requests found for this school' });
    }

    res.status(200).json({ leaveRequests: filteredLeaveRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const approveOrRejectLeave = async (req, res) => {
  const { leaveId, action, reason } = req.body; 
  console.log(reason)
  try {
    // Find the leave request by its ID
    const leave = await prismaClient.leaveRequest.findUnique({
      where: { id: leaveId }
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const student = await prismaClient.student.findUnique({
      where: { id: leave.userId }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const status = action === 'approve' ? 'Approved' : 'Rejected';

    // Update the leave status
    await prismaClient.leaveRequest.update({
      where: { id: leaveId },
      data: { status }
    });

    // Prepare the email content
    let emailText = `Dear ${student.name},\n\nYour leave request has been ${status}.`;

    // Add the rejection reason if the leave was rejected
    if (action === 'reject' && reason) {
      emailText += `\n\nReason for rejection: ${reason}`;
    }

    emailText += `\n\nIf you have any questions, please contact the administration.\n\nBest regards,\nNewton School of Technology`;

    // Send an email to the student
    const mailOptions = {
      from: 'vivekananda.99666@gmail.com', // Sender address
      to: student.email, // List of receivers
      subject: 'Leave Request Status Update', // Subject line
      text: emailText // Email content
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `Leave request ${action}ed successfully` });
  } catch (error) {
    console.error('Error processing leave request:', error);
    res.status(500).json({ message: 'An error occurred while processing the leave request' });
  }
};


const createEvents =  async (req, res) => {
  try {
    const events = req.body;

    // Validate the structure of the events array
    if (!Array.isArray(events)) {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    // Format dates to ISO-8601 format
    const formattedEvents = events.map(event => ({
      ...event,
      date: new Date(event.date).toISOString(),
      endDate: new Date(event.endDate).toISOString()
    }));

    // Insert events into the database
    await prismaClient.event.createMany({
      data: formattedEvents,
    });

    res.status(200).json({ message: 'Events added successfully' });
  } catch (error) {
    console.error('Error inserting events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getEvents = async (req, res)=>{
  try {
    const events = await prismaClient.event.findMany();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
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
};
