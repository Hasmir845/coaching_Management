const Batch = require('../models/Batch');
const SlotAttendance = require('../models/SlotAttendance');

const DAY_NAME_TO_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function dayIndexFromDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getDay();
}

function normalizeDayName(s) {
  return (s || '').trim().toLowerCase();
}

function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
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

function addDaysToDateKey(dateKey, n) {
  const dt = parseDateKey(dateKey);
  if (!dt) return null;
  dt.setDate(dt.getDate() + n);
  const y = dt.getFullYear();
  const mo = String(dt.getMonth() + 1).padStart(2, '0');
  const da = String(dt.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

// Checklist rows for one calendar day (slots whose weekday matches that day)
exports.getChecklistForDate = async (req, res) => {
  try {
    const dateKey = (req.query.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      return res.status(400).json({ message: 'Invalid or missing date (use YYYY-MM-DD)' });
    }

    const targetDow = dayIndexFromDateKey(dateKey);

    const batches = await Batch.find({ status: { $ne: 'inactive' } })
      .select('name subject scheduleSlots')
      .populate('scheduleSlots.teacher');

    const marks = await SlotAttendance.find({ dateKey }).lean();
    const markMap = new Map();
    marks.forEach((m) => {
      markMap.set(`${String(m.batch)}_${String(m.scheduleSlotId)}`, m);
    });

    const rows = [];
    for (const b of batches) {
      for (const slot of b.scheduleSlots || []) {
        const slotDow = DAY_NAME_TO_INDEX[normalizeDayName(slot.dayOfWeek)];
        if (slotDow === undefined || slotDow !== targetDow) continue;
        const sid = slot._id.toString();
        const key = `${b._id.toString()}_${sid}`;
        const existing = markMap.get(key);
        rows.push({
          batchId: b._id,
          batchName: b.name,
          batchSubject: b.subject,
          slotSubject: (slot.subject && String(slot.subject).trim()) || b.subject,
          scheduleSlotId: slot._id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime || '',
          teacherId: slot.teacher?._id || slot.teacher,
          teacherName: slot.teacher?.name || '—',
          dateKey,
          calendarLabel: dateKey,
          taken: existing ? existing.taken : null,
          attendanceId: existing?._id || null,
        });
      }
    }

    rows.sort((a, b) => (a.batchName || '').localeCompare(b.batchName) || (a.startTime || '').localeCompare(b.startTime || ''));

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.upsertSlotAttendance = async (req, res) => {
  try {
    const { batch, scheduleSlotId, dateKey, taken } = req.body;
    if (!batch || !scheduleSlotId || !dateKey || typeof taken !== 'boolean') {
      return res.status(400).json({ message: 'batch, scheduleSlotId, dateKey, and taken (boolean) are required' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey).trim())) {
      return res.status(400).json({ message: 'dateKey must be YYYY-MM-DD' });
    }

    const b = await Batch.findById(batch).select('name subject scheduleSlots').populate('scheduleSlots.teacher');
    if (!b) return res.status(404).json({ message: 'Batch not found' });

    const slot = (b.scheduleSlots || []).find((s) => s._id.toString() === String(scheduleSlotId));
    if (!slot) return res.status(404).json({ message: 'Schedule slot not found on this batch' });

    const doc = await SlotAttendance.findOneAndUpdate(
      { batch, scheduleSlotId, dateKey: String(dateKey).trim() },
      {
        $set: {
          taken,
          teacher: slot.teacher || undefined,
          batchName: b.name,
          subject: (slot.subject && String(slot.subject).trim()) || b.subject,
          startTime: slot.startTime,
          endTime: slot.endTime || '',
          dayOfWeek: slot.dayOfWeek,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(doc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Teacher summary for a week (Mon–Sun) by weekStart Monday YYYY-MM-DD
exports.getWeekTeacherSummary = async (req, res) => {
  try {
    const todayKey = () => {
      const t = new Date();
      const y = t.getFullYear();
      const mo = String(t.getMonth() + 1).padStart(2, '0');
      const da = String(t.getDate()).padStart(2, '0');
      return `${y}-${mo}-${da}`;
    };

    let weekStart = (req.query.weekStart || '').trim();
    if (!weekStart) weekStart = mondayOfWeekContaining(todayKey());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      return res.status(400).json({ message: 'weekStart must be YYYY-MM-DD (Monday of the week)' });
    }

    const keys = [];
    for (let i = 0; i < 7; i++) {
      keys.push(addDaysToDateKey(weekStart, i));
    }

    const records = await SlotAttendance.find({
      dateKey: { $in: keys },
      taken: true,
    })
      .populate('teacher')
      .lean();

    const byTeacher = new Map();
    for (const r of records) {
      const tid = r.teacher ? r.teacher._id.toString() : 'unknown';
      const name = r.teacher?.name || 'Unknown';
      if (!byTeacher.has(tid)) {
        byTeacher.set(tid, { teacherId: r.teacher?._id, teacherName: name, takenCount: 0, batches: new Set() });
      }
      const entry = byTeacher.get(tid);
      entry.takenCount += 1;
      if (r.batchName) entry.batches.add(r.batchName);
    }

    const summary = [...byTeacher.values()].map((v) => ({
      teacherId: v.teacherId,
      teacherName: v.teacherName,
      takenCount: v.takenCount,
      batches: [...v.batches].sort(),
    }));
    summary.sort((a, b) => b.takenCount - a.takenCount);

    res.json({ weekStart, weekEnd: addDaysToDateKey(weekStart, 6), summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Spreadsheet-style log: every checklist "Yes" (taken) with date, teacher, subject, batch, time
exports.getTakenClassRegister = async (req, res) => {
  try {
    const startDate = (req.query.startDate || '').trim();
    const endDate = (req.query.endDate || '').trim();

    const filter = { taken: true };
    if (startDate || endDate) {
      filter.dateKey = {};
      if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) filter.dateKey.$gte = startDate;
      if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) filter.dateKey.$lte = endDate;
    }

    const rows = await SlotAttendance.find(filter)
      .populate('teacher', 'name')
      .sort({ dateKey: -1, batchName: 1, startTime: 1 })
      .lean();

    const register = rows.map((r) => ({
      _id: r._id,
      dateKey: r.dateKey,
      teacherId: r.teacher?._id,
      teacherName: r.teacher?.name || '—',
      batchName: r.batchName || '—',
      subject: r.subject || '—',
      dayOfWeek: r.dayOfWeek || '',
      startTime: r.startTime || '',
      endTime: r.endTime || '',
    }));

    const countsMap = new Map();
    for (const row of register) {
      const key = row.teacherName;
      countsMap.set(key, (countsMap.get(key) || 0) + 1);
    }
    const teacherCounts = [...countsMap.entries()]
      .map(([teacherName, classCount]) => ({ teacherName, classCount }))
      .sort((a, b) => b.classCount - a.classCount);

    res.json({ register, teacherCounts, totalClasses: register.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
