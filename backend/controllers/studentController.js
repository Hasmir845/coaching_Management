const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Activity = require('../models/Activity');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findBatchByName(batchName) {
  const bn = (batchName || '').trim();
  if (!bn) return null;
  return Batch.findOne({ name: new RegExp(`^${escapeRegex(bn)}$`, 'i') });
}

async function applyBatchNameToPayload(payload) {
  const next = { ...payload };
  if (next.batchName !== undefined) {
    const raw = next.batchName;
    delete next.batchName;
    const trimmed = (raw || '').trim();
    if (!trimmed) {
      next.batch = null;
    } else {
      const batchDoc = await findBatchByName(trimmed);
      if (!batchDoc) {
        const err = new Error(`No batch found named "${trimmed}"`);
        err.status = 400;
        throw err;
      }
      next.batch = batchDoc._id;
    }
  }
  return next;
}

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('batch');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('batch');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create student
exports.createStudent = async (req, res) => {
  try {
    let payload = { ...req.body };
    if (payload.batchName) {
      payload = await applyBatchNameToPayload(payload);
    } else if (payload.batch === '') {
      payload.batch = null;
    }

    const student = new Student(payload);
    const savedStudent = await student.save();

    if (savedStudent.batch) {
      await Batch.findByIdAndUpdate(savedStudent.batch, {
        $addToSet: { students: savedStudent._id },
      });
    }

    await Activity.create({
      action: `Student ${savedStudent.name} added`,
      type: 'student',
      relatedId: savedStudent._id,
    });

    const populated = await Student.findById(savedStudent._id).populate('batch');
    res.status(201).json(populated);
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ message: error.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const prev = await Student.findById(req.params.id);
    if (!prev) return res.status(404).json({ message: 'Student not found' });

    let payload = { ...req.body };
    if (payload.batchName !== undefined) {
      payload = await applyBatchNameToPayload(payload);
    } else if (payload.batch === '') {
      payload.batch = null;
    }

    const prevBatchId = prev.batch ? prev.batch.toString() : null;

    const student = await Student.findByIdAndUpdate(req.params.id, payload, { new: true }).populate(
      'batch'
    );

    const nextBatchId = student.batch?._id
      ? student.batch._id.toString()
      : student.batch
        ? student.batch.toString()
        : null;

    if (prevBatchId !== nextBatchId) {
      if (prevBatchId) {
        await Batch.findByIdAndUpdate(prevBatchId, { $pull: { students: req.params.id } });
      }
      if (nextBatchId) {
        await Batch.findByIdAndUpdate(nextBatchId, { $addToSet: { students: req.params.id } });
      }
    }

    await Activity.create({
      action: `Student updated`,
      type: 'student',
      relatedId: req.params.id,
    });

    res.json(student);
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ message: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (student.batch) {
      await Batch.findByIdAndUpdate(student.batch, { $pull: { students: req.params.id } });
    }

    await Activity.create({
      action: `Student ${student.name} deleted`,
      type: 'student',
      relatedId: req.params.id,
    });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search students
exports.searchStudents = async (req, res) => {
  try {
    const query = req.query.q;
    const students = await Student.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    }).populate('batch');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get students by batch
exports.getStudentsByBatch = async (req, res) => {
  try {
    const students = await Student.find({ batch: req.params.batchId }).populate('batch');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
