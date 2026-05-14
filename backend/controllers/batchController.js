const Batch = require('../models/Batch');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Activity = require('../models/Activity');

const batchPopulate = [
  { path: 'teacher' },
  { path: 'teachers' },
  { path: 'students' },
  { path: 'scheduleSlots.teacher' },
];

function teacherIdsFromBatchDoc(batch) {
  const ids = new Set();
  (batch.teachers || []).forEach((t) => {
    if (t) ids.add(t._id ? t._id.toString() : t.toString());
  });
  if (batch.teacher) {
    ids.add(batch.teacher._id ? batch.teacher._id.toString() : batch.teacher.toString());
  }
  (batch.scheduleSlots || []).forEach((s) => {
    if (s.teacher) ids.add(s.teacher._id ? s.teacher._id.toString() : s.teacher.toString());
  });
  return [...ids];
}

async function syncTeacherBatchRefs(batchId, batchDoc) {
  const want = new Set(teacherIdsFromBatchDoc(batchDoc));
  const batchObjectId = batchId;
  const teachersLinked = await Teacher.find({ batches: batchObjectId }).select('_id');
  for (const t of teachersLinked) {
    if (!want.has(t._id.toString())) {
      await Teacher.findByIdAndUpdate(t._id, { $pull: { batches: batchObjectId } });
    }
  }
  for (const tid of want) {
    await Teacher.findByIdAndUpdate(tid, { $addToSet: { batches: batchObjectId } });
  }
}

function normalizeBatchPayload(body) {
  const out = { ...body };
  if (out.capacity === '' || out.capacity === undefined) delete out.capacity;
  else if (typeof out.capacity === 'string') out.capacity = Number(out.capacity);
  if (out.startDate) out.startDate = new Date(out.startDate);
  if (out.endDate) out.endDate = new Date(out.endDate);
  if (!Array.isArray(out.teachers)) out.teachers = [];
  out.teachers = out.teachers.filter(Boolean);
  if (out.teacher && !out.teachers.length) {
    out.teachers = [out.teacher];
  }
  if (!Array.isArray(out.scheduleSlots)) out.scheduleSlots = [];
  out.scheduleSlots = out.scheduleSlots
    .filter((s) => s && s.dayOfWeek && s.startTime)
    .map((s) => ({
      dayOfWeek: String(s.dayOfWeek).trim(),
      startTime: String(s.startTime).trim(),
      endTime: s.endTime ? String(s.endTime).trim() : '',
      subject: s.subject ? String(s.subject).trim() : undefined,
      teacher: s.teacher || undefined,
    }));
  return out;
}

// Get all batches
exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find().populate(batchPopulate);
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get batch by ID
exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate(batchPopulate);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create batch
exports.createBatch = async (req, res) => {
  try {
    const payload = normalizeBatchPayload(req.body);
    const batch = new Batch(payload);
    const savedBatch = await batch.save();
    const populated = await Batch.findById(savedBatch._id).populate(batchPopulate);
    await syncTeacherBatchRefs(savedBatch._id, populated);

    await Activity.create({
      action: `Batch ${payload.name} created`,
      type: 'batch',
      relatedId: savedBatch._id,
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update batch
exports.updateBatch = async (req, res) => {
  try {
    const payload = normalizeBatchPayload(req.body);
    const batch = await Batch.findByIdAndUpdate(req.params.id, payload, { new: true }).populate(
      batchPopulate
    );

    await syncTeacherBatchRefs(req.params.id, batch);

    await Activity.create({
      action: `Batch updated`,
      type: 'batch',
      relatedId: req.params.id,
    });

    res.json(batch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete batch
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    await Activity.create({
      action: `Batch ${batch.name} deleted`,
      type: 'batch',
      relatedId: req.params.id,
    });

    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search batches
exports.searchBatches = async (req, res) => {
  try {
    const query = req.query.q;
    const batches = await Batch.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { subject: { $regex: query, $options: 'i' } },
      ],
    }).populate(batchPopulate);
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign teacher to batch (adds to teachers list; does not remove others)
exports.assignTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { teachers: teacherId } },
      { new: true }
    ).populate(batchPopulate);

    await Teacher.findByIdAndUpdate(teacherId, { $addToSet: { batches: req.params.id } });

    res.json(batch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove one teacher from batch
exports.removeTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { $pull: { teachers: teacherId } },
      { new: true }
    ).populate(batchPopulate);

    await Teacher.findByIdAndUpdate(teacherId, { $pull: { batches: req.params.id } });

    res.json(batch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add student to batch
exports.addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { students: studentId } },
      { new: true }
    ).populate(batchPopulate);

    await Student.findByIdAndUpdate(studentId, { batch: req.params.id });

    res.json(batch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove student from batch
exports.removeStudent = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { $pull: { students: req.params.studentId } },
      { new: true }
    ).populate(batchPopulate);

    await Student.findByIdAndUpdate(req.params.studentId, { batch: null });

    res.json(batch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
