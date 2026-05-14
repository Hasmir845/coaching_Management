const Teacher = require('../models/Teacher');
const Batch = require('../models/Batch');
const Activity = require('../models/Activity');

// Get all teachers
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('batches');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('batches');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create teacher
exports.createTeacher = async (req, res) => {
  const teacher = new Teacher(req.body);
  try {
    const savedTeacher = await teacher.save();
    
    // Log activity
    await Activity.create({
      action: `Teacher ${req.body.name} added`,
      type: 'teacher',
      relatedId: savedTeacher._id,
    });

    res.status(201).json(savedTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update teacher
exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Log activity
    await Activity.create({
      action: `Teacher updated`,
      type: 'teacher',
      relatedId: req.params.id,
    });

    res.json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    
    // Log activity
    await Activity.create({
      action: `Teacher ${teacher.name} deleted`,
      type: 'teacher',
      relatedId: req.params.id,
    });

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search teachers
exports.searchTeachers = async (req, res) => {
  try {
    const query = req.query.q;
    const teachers = await Teacher.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { subject: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign batch to teacher
exports.assignBatch = async (req, res) => {
  try {
    const { batchId } = req.body;
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { $push: { batches: batchId } },
      { new: true }
    );
    res.json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
