const ClassTracking = require('../models/ClassTracking');

/** Same resolution order as dashboard: class.teacher, else batch.teachers[0], else batch.teacher */
function resolveTeacherFromClassDoc(cls) {
  if (cls.teacher) return cls.teacher;
  const batch = cls.batch;
  if (!batch) return null;
  if (batch.teachers && batch.teachers.length) return batch.teachers[0];
  if (batch.teacher) return batch.teacher;
  return null;
}

// Get teacher class count report
exports.getTeacherClassCount = async (req, res) => {
  try {
    const sessions = await ClassTracking.find({})
      .populate('teacher', 'name')
      .populate({
        path: 'batch',
        select: 'teacher teachers',
        populate: [
          { path: 'teacher', select: 'name' },
          { path: 'teachers', select: 'name' },
        ],
      });

    const byKey = new Map();
    for (const cls of sessions) {
      const t = resolveTeacherFromClassDoc(cls);
      const key = t && t._id ? String(t._id) : 'unknown';
      if (!byKey.has(key)) {
        byKey.set(key, {
          _id: t && t._id ? t._id : null,
          teacherName: (t && t.name) || 'Unknown',
          classCount: 0,
        });
      }
      byKey.get(key).classCount += 1;
    }

    const report = [...byKey.values()].sort((a, b) => b.classCount - a.classCount);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get absent count report
exports.getAbsentCount = async (req, res) => {
  try {
    const sessions = await ClassTracking.find({})
      .populate('teacher', 'name')
      .populate({
        path: 'batch',
        select: 'teacher teachers',
        populate: [
          { path: 'teacher', select: 'name' },
          { path: 'teachers', select: 'name' },
        ],
      });

    const byKey = new Map();
    for (const cls of sessions) {
      const t = resolveTeacherFromClassDoc(cls);
      const key = t && t._id ? String(t._id) : 'unknown';
      if (!byKey.has(key)) {
        byKey.set(key, {
          _id: t && t._id ? t._id : null,
          teacher: (t && t.name) || 'Unknown',
          count: 0,
        });
      }
      byKey.get(key).count += cls.totalAbsent || 0;
    }

    const report = [...byKey.values()].sort((a, b) => b.count - a.count);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get batch class history
exports.getBatchClassHistory = async (req, res) => {
  try {
    const history = await ClassTracking.find({ batch: req.params.batchId })
      .sort({ date: -1 });

    const report = history.map((record) => ({
      date: record.date,
      topic: record.topic,
      presentCount: record.totalPresent,
      absentCount: record.totalAbsent,
    }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
