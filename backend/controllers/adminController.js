const User = require('../models/User');
const Teacher = require('../models/Teacher');

const DEFAULT_ADMIN_EMAIL = process.env.FIRST_ADMIN_EMAIL || 'hasmirhassan@gmail.com';

// Get all users with their roles
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('teacher', 'name email subject')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get current user data
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.firebaseUID })
      .populate('teacher', 'name email subject batches');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.lastSeenAt = new Date();
    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Create or update user
const upsertUser = async (req, res) => {
  try {
    const { firebaseUID, email, displayName, photoURL, role, teacherData } = req.body;

    if (!firebaseUID || !email) {
      return res.status(400).json({ message: 'firebaseUID and email are required' });
    }

    let user = await User.findOne({ firebaseUID }).populate('teacher');

    const shouldBeAdmin = email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
    const existingAdmin = await User.exists({ isAdmin: true });
    const isTeacherRole = role === 'teacher';

    if (!user) {
      const newRole = shouldBeAdmin || !existingAdmin ? 'admin' : isTeacherRole ? 'teacher' : 'user';
      user = new User({
        firebaseUID,
        email,
        displayName,
        photoURL,
        role: newRole,
        isAdmin: shouldBeAdmin || !existingAdmin,
        lastSeenAt: new Date(),
      });
    } else {
      user.email = email;
      user.displayName = displayName;
      user.photoURL = photoURL;
      user.lastSeenAt = new Date();

      if (shouldBeAdmin) {
        user.role = 'admin';
        user.isAdmin = true;
      } else if (isTeacherRole) {
        user.role = 'teacher';
        user.isAdmin = false;
      }
    }

    if (isTeacherRole) {
      const teacherPayload = {
        name: teacherData?.name || displayName || email,
        email,
        subject: teacherData?.subject || 'General',
        phone: teacherData?.phone || '',
        joiningDate: teacherData?.joiningDate ? new Date(teacherData.joiningDate) : new Date(),
        status: teacherData?.status || 'active',
      };

      if (user.teacher) {
        await Teacher.findByIdAndUpdate(user.teacher._id || user.teacher, teacherPayload, {
          new: true,
        });
      } else {
        const teacher = await Teacher.create(teacherPayload);
        user.teacher = teacher._id;
      }
    }

    await user.save();
    await user.populate('teacher', 'name email subject batches');
    res.json(user);
  } catch (error) {
    console.error('Error upserting user:', error);
    res.status(500).json({ message: 'Error upserting user', error: error.message });
  }
};

// Make user an admin
const makeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin: true, role: 'admin', adminRequestStatus: 'approved', adminRequestReviewedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User promoted to admin', user });
  } catch (error) {
    console.error('Error making admin:', error);
    res.status(500).json({ message: 'Error promoting user', error: error.message });
  }
};

// Remove admin from user
const removeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin: false, role: 'user' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Admin role removed', user });
  } catch (error) {
    console.error('Error removing admin:', error);
    res.status(500).json({ message: 'Error removing admin', error: error.message });
  }
};

// Remove teacher role from user and delete teacher profile
const removeTeacher = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'teacher') {
      return res.status(400).json({ message: 'User is not a teacher' });
    }

    const teacherId = user.teacher;
    user.role = 'user';
    user.teacher = null;
    user.teacherRequestStatus = 'none';
    user.teacherRequestAt = null;
    user.teacherRequestReviewedAt = null;
    user.teacherRequestPayload = null;
    await user.save();

    if (teacherId) {
      await Teacher.findByIdAndDelete(teacherId);
    }

    res.json({ message: 'Teacher removed', user });
  } catch (error) {
    console.error('Error removing teacher:', error);
    res.status(500).json({ message: 'Error removing teacher', error: error.message });
  }
};

const clearAdminRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.adminRequestStatus === 'none' || user.adminRequestStatus === 'approved') {
      return res.status(400).json({ message: 'Cannot clear admin request at this stage' });
    }

    user.adminRequestStatus = 'none';
    user.adminRequestAt = null;
    user.adminRequestReviewedAt = null;
    await user.save();

    res.json({ message: 'Admin request cleared', user });
  } catch (error) {
    console.error('Error clearing admin request:', error);
    res.status(500).json({ message: 'Error clearing admin request', error: error.message });
  }
};

const clearTeacherRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.teacherRequestStatus === 'none' || user.teacherRequestStatus === 'approved') {
      return res.status(400).json({ message: 'Cannot clear teacher request at this stage' });
    }

    user.teacherRequestStatus = 'none';
    user.teacherRequestAt = null;
    user.teacherRequestReviewedAt = null;
    user.teacherRequestPayload = null;
    await user.save();

    res.json({ message: 'Teacher request cleared', user });
  } catch (error) {
    console.error('Error clearing teacher request:', error);
    res.status(500).json({ message: 'Error clearing teacher request', error: error.message });
  }
};

// Assign teacher role to user
const applyForAdmin = async (req, res) => {
  return res.status(403).json({
    message: 'Admin request flow is disabled. Contact an existing admin to assign admin access.',
  });
};

const getPendingAdminRequests = async (req, res) => {
  try {
    const pendingUsers = await User.find({ adminRequestStatus: 'pending' })
      .sort({ adminRequestAt: -1 });

    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    res.status(500).json({ message: 'Error fetching admin requests', error: error.message });
  }
};

const approveAdminRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isAdmin: true,
        role: 'admin',
        adminRequestStatus: 'approved',
        adminRequestReviewedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Admin request approved', user });
  } catch (error) {
    console.error('Error approving admin request:', error);
    res.status(500).json({ message: 'Error approving admin request', error: error.message });
  }
};

const rejectAdminRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        adminRequestStatus: 'rejected',
        adminRequestReviewedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Admin request rejected', user });
  } catch (error) {
    console.error('Error rejecting admin request:', error);
    res.status(500).json({ message: 'Error rejecting admin request', error: error.message });
  }
};

const applyForTeacher = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.firebaseUID });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'teacher') {
      return res.status(400).json({ message: 'You are already a teacher' });
    }

    if (user.teacherRequestStatus === 'pending') {
      return res.status(400).json({ message: 'Teacher request is already pending' });
    }

    const { subject } = req.body;

    user.teacherRequestStatus = 'pending';
    user.teacherRequestAt = new Date();
    user.teacherRequestReviewedAt = null;
    user.teacherRequestPayload = {
      subject: subject || 'General',
    };
    await user.save();

    res.json({ message: 'Teacher request submitted', user });
  } catch (error) {
    console.error('Error applying for teacher:', error);
    res.status(500).json({ message: 'Error applying for teacher', error: error.message });
  }
};

const getPendingTeacherRequests = async (req, res) => {
  try {
    const pendingUsers = await User.find({ teacherRequestStatus: 'pending' }).sort({ teacherRequestAt: -1 });

    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching teacher requests:', error);
    res.status(500).json({ message: 'Error fetching teacher requests', error: error.message });
  }
};

const approveTeacherRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'teacher' && user.teacher) {
      user.teacherRequestStatus = 'approved';
      user.teacherRequestReviewedAt = new Date();
      await user.save();
      await user.populate('teacher', 'name email subject batches');
      return res.json({ message: 'Teacher request approved', user });
    }

    const teacherData = user.teacherRequestPayload || {};
    const teacherPayload = {
      name: user.displayName || user.email,
      email: user.email,
      subject: teacherData.subject || 'General',
      phone: teacherData.phone || '',
      joiningDate: teacherData.joiningDate ? new Date(teacherData.joiningDate) : new Date(),
      status: teacherData.status || 'active',
    };

    let teacher;
    if (user.teacher) {
      teacher = await Teacher.findByIdAndUpdate(user.teacher, teacherPayload, { new: true });
    } else {
      teacher = await Teacher.findOne({ email: user.email });
      if (teacher) {
        teacher = await Teacher.findByIdAndUpdate(teacher._id, teacherPayload, { new: true });
      } else {
        teacher = await Teacher.create(teacherPayload);
      }
    }

    user.role = 'teacher';
    user.teacher = teacher._id;
    user.teacherRequestStatus = 'approved';
    user.teacherRequestReviewedAt = new Date();
    await user.save();

    await user.populate('teacher', 'name email subject batches');

    res.json({ message: 'Teacher request approved', user });
  } catch (error) {
    console.error('Error approving teacher request:', error);
    res.status(500).json({ message: 'Error approving teacher request', error: error.message });
  }
};

const rejectTeacherRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        teacherRequestStatus: 'rejected',
        teacherRequestReviewedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Teacher request rejected', user });
  } catch (error) {
    console.error('Error rejecting teacher request:', error);
    res.status(500).json({ message: 'Error rejecting teacher request', error: error.message });
  }
};

const assignTeacher = async (req, res) => {
  try {
    const { userId } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({ message: 'teacherId is required' });
    }

    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: 'teacher', teacher: teacherId },
      { new: true }
    ).populate('teacher', 'name email subject');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Teacher role assigned', user });
  } catch (error) {
    console.error('Error assigning teacher:', error);
    res.status(500).json({ message: 'Error assigning teacher', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.teacher) {
      await Teacher.findByIdAndDelete(user.teacher);
    }

    res.json({ message: 'User deleted', user });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get teachers only
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .populate('teacher', 'name email subject batches')
      .sort({ createdAt: -1 });

    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getCurrentUser,
  upsertUser,
  applyForAdmin,
  getPendingAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
  applyForTeacher,
  getPendingTeacherRequests,
  approveTeacherRequest,
  rejectTeacherRequest,
  makeAdmin,
  removeAdmin,
  removeTeacher,
  clearAdminRequest,
  clearTeacherRequest,
  assignTeacher,
  deleteUser,
  getTeachers,
};
