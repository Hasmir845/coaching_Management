const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const ClassTracking = require('../models/ClassTracking');
const Activity = require('../models/Activity');

function startEndOfToday() {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  return { startDate, endDate };
}

const ORDERED_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function parseDateKey(dateKey) {
  const [y, m, d] = String(dateKey).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function addDaysToDateKey(dateKey, n) {
  const dt = parseDateKey(dateKey);
  if (!dt) return null;
  dt.setDate(dt.getDate() + n);
  const y = dt.getFullYear();
  const mo = String(dt.getMonth() + 1).padStart(2, '0');
  const da = String(dt.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

function mondayOfWeekContaining(dateKey) {
  const dt = parseDateKey(dateKey);
  if (!dt || Number.isNaN(dt.getTime())) return null;
  const day = dt.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(dt);
  mon.setDate(mon.getDate() + diff);
  const y = mon.getFullYear();
  const mo = String(mon.getMonth() + 1).padStart(2, '0');
  const da = String(mon.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

function calendarDateForSlotDay(weekMondayKey, dayName) {
  const idx = ORDERED_DAYS.findIndex((d) => d.toLowerCase() === (dayName || '').trim().toLowerCase());
  if (idx < 0) return null;
  return addDaysToDateKey(weekMondayKey, idx);
}

function todayDateKey() {
  const t = new Date();
  const y = t.getFullYear();
  const mo = String(t.getMonth() + 1).padStart(2, '0');
  const da = String(t.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const totalTeachers = await Teacher.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalBatches = await Batch.countDocuments();

    res.json({
      totalTeachers,
      totalStudents,
      totalBatches,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Today's classes that were actually held (teacher marked "taken")
exports.getTodayClasses = async (req, res) => {
  try {
    const { startDate, endDate } = startEndOfToday();

    const todayClasses = await ClassTracking.find({
      date: { $gte: startDate, $lte: endDate },
      $or: [{ teacherClassStatus: 'taken' }, { teacherClassStatus: { $exists: false } }],
    })
      .populate('teacher')
      .populate({
        path: 'batch',
        populate: [{ path: 'teacher' }, { path: 'teachers' }],
      });

    const result = todayClasses.map((cls) => {
      const slotTeacher =
        cls.teacher ||
        (cls.batch?.teachers?.length ? cls.batch.teachers[0] : null) ||
        cls.batch?.teacher;
      return {
        _id: cls._id,
        batchName: cls.batch?.name,
        subject: cls.batch?.subject,
        teacherName: slotTeacher?.name || 'Unassigned',
        time: new Date(cls.date).toLocaleTimeString(),
        topic: cls.topic,
        status: cls.teacherClassStatus || 'taken',
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Classes marked "not taken" today (teacher absent / class not held)
exports.getAbsentTeachers = async (req, res) => {
  try {
    const { startDate, endDate } = startEndOfToday();

    const notHeld = await ClassTracking.find({
      date: { $gte: startDate, $lte: endDate },
      teacherClassStatus: 'not_taken',
    })
      .populate('teacher')
      .populate('batch');

    const result = notHeld.map((cls) => ({
      _id: cls._id,
      teacherName: cls.teacher?.name || 'Unassigned',
      batchName: cls.batch?.name,
      topic: cls.topic,
      notes: cls.notes,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Weekly timetable: calendar date + slot subject + teacher (weekStart = Monday YYYY-MM-DD)
exports.getWeeklySchedule = async (req, res) => {
  try {
    let weekStart = (req.query.weekStart || '').trim();
    if (!weekStart) weekStart = mondayOfWeekContaining(todayDateKey());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      return res.status(400).json({ message: 'weekStart must be YYYY-MM-DD (Monday of the week)' });
    }

    const batches = await Batch.find({ status: { $ne: 'inactive' } })
      .select('name subject scheduleSlots')
      .populate('scheduleSlots.teacher');

    const rows = [];

    for (const b of batches) {
      const slots = b.scheduleSlots || [];
      for (const s of slots) {
        const calendarDate = calendarDateForSlotDay(weekStart, s.dayOfWeek);
        const slotSubject = (s.subject && String(s.subject).trim()) || b.subject;
        const dt = calendarDate ? parseDateKey(calendarDate) : null;
        rows.push({
          calendarDate: calendarDate || '',
          displayDate: dt && !Number.isNaN(dt.getTime()) ? dt.toLocaleDateString() : '',
          dayOfWeek: s.dayOfWeek,
          batchName: b.name,
          subject: slotSubject,
          batchSubject: b.subject,
          startTime: s.startTime,
          endTime: s.endTime || '',
          teacherName: s.teacher?.name || '—',
        });
      }
    }

    rows.sort((a, b) => {
      const da = ORDERED_DAYS.indexOf(a.dayOfWeek) >= 0 ? ORDERED_DAYS.indexOf(a.dayOfWeek) : 99;
      const db = ORDERED_DAYS.indexOf(b.dayOfWeek) >= 0 ? ORDERED_DAYS.indexOf(b.dayOfWeek) : 99;
      if (da !== db) return da - db;
      const ca = a.calendarDate || '';
      const cb = b.calendarDate || '';
      if (ca !== cb) return ca.localeCompare(cb);
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

    res.json({ weekStart, weekEnd: addDaysToDateKey(weekStart, 6), rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const result = activities.map((act) => ({
      action: act.action,
      timestamp: new Date(act.createdAt).toLocaleString(),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
