const ClassTracking = require('../models/ClassTracking');
const Activity = require('../models/Activity');

const classPopulate = [
  { path: 'batch', populate: [{ path: 'teacher' }, { path: 'teachers' }] },
  { path: 'teacher' },
  { path: 'presentStudents.studentId' },
];

// Get all class records
exports.getClassTracking = async (req, res) => {
  try {
    const records = await ClassTracking.find().populate(classPopulate);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get class record by ID
exports.getClassTrackingById = async (req, res) => {
  try {
    const record = await ClassTracking.findById(req.params.id).populate(classPopulate);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create class record
exports.createClassTracking = async (req, res) => {
  try {
    const presentCount = req.body.presentStudents?.filter((s) => s.present).length || 0;
    const absentCount = (req.body.presentStudents?.length || 0) - presentCount;

    const record = new ClassTracking({
      ...req.body,
      totalPresent: presentCount,
      totalAbsent: absentCount,
    });

    const savedRecord = await record.save();

    await Activity.create({
      action: `Class attendance marked`,
      type: 'class',
      relatedId: savedRecord._id,
    });

    const populated = await ClassTracking.findById(savedRecord._id).populate(classPopulate);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update class record
exports.updateClassTracking = async (req, res) => {
  try {
    const presentCount = req.body.presentStudents?.filter((s) => s.present).length || 0;
    const absentCount = (req.body.presentStudents?.length || 0) - presentCount;

    const record = await ClassTracking.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        totalPresent: presentCount,
        totalAbsent: absentCount,
      },
      { new: true }
    );

    const populated = await ClassTracking.findById(record._id).populate(classPopulate);
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete class record
exports.deleteClassTracking = async (req, res) => {
  try {
    await ClassTracking.findByIdAndDelete(req.params.id);

    await Activity.create({
      action: `Class attendance record deleted`,
      type: 'class',
      relatedId: req.params.id,
    });

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get classes by date
exports.getByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    const records = await ClassTracking.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate(classPopulate);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get classes by batch
exports.getByBatch = async (req, res) => {
  try {
    const records = await ClassTracking.find({ batch: req.params.batchId }).populate(classPopulate);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
