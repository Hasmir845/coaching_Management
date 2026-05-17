const User = require('../models/User');

/** Middleware to check if user is authenticated via Firebase UID (optional: checks MongoDB for role) */
async function checkAuthUser(req, res, next) {
  try {
    const firebaseUID = req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(401).json({ message: 'Firebase UID required in x-firebase-uid header' });
    }

    // Try to find user in DB to get role
    const user = await User.findOne({ firebaseUID });
    req.user = {
      firebaseUID,
      role: user?.role || 'user',
      isAdmin: user?.isAdmin || false,
      userId: user?._id,
      teacherId: user?.teacher,
    };

    next();
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ message: 'Authentication check failed' });
  }
}

/** Middleware to ensure user is admin */
async function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Authorization check failed' });
  }
}

/** Middleware to ensure user is a teacher */
async function requireTeacher(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (req.user.role !== 'teacher' && !req.user.teacherId) {
      return res.status(403).json({ message: 'Teacher access required' });
    }

    next();
  } catch (error) {
    console.error('Teacher check error:', error);
    res.status(500).json({ message: 'Authorization check failed' });
  }
}

module.exports = {
  checkAuthUser,
  requireAdmin,
  requireTeacher,
};
