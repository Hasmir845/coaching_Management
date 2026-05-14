import React, { useState, useEffect, useMemo } from 'react';
import { classTrackingAPI, batchAPI, studentAPI, teacherAPI, slotAttendanceAPI } from '../services/api';
import { Plus, Edit2, Trash2, BookOpen, ClipboardCheck } from 'lucide-react';
import { format, parseISO, startOfWeek } from 'date-fns';
import { refToId } from '../utils/refs';

function teachersForBatch(batch, allTeachers) {
  if (!batch) return [];
  const ids = new Set();
  (batch.teachers || []).forEach((t) => {
    const id = refToId(t);
    if (id) ids.add(id);
  });
  const leg = refToId(batch.teacher);
  if (leg) ids.add(leg);
  return [...ids]
    .map((id) => allTeachers.find((t) => refToId(t) === id))
    .filter(Boolean);
}

function mondayKey(isoDate) {
  if (!isoDate) return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  return format(startOfWeek(parseISO(isoDate), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

const ClassTracking = () => {
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [slotChecklist, setSlotChecklist] = useState([]);
  const [weekSummary, setWeekSummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [formData, setFormData] = useState({
    batch: '',
    teacher: '',
    teacherClassStatus: 'taken',
    date: format(new Date(), 'yyyy-MM-dd'),
    topic: '',
    notes: '',
    presentStudents: [],
  });

  const loadSlotExtrasFor = async (dateStr) => {
    try {
      const mon = mondayKey(dateStr);
      const [clRes, sumRes] = await Promise.all([
        slotAttendanceAPI.getChecklist(dateStr),
        slotAttendanceAPI.getWeekSummary(mon),
      ]);
      setSlotChecklist(clRes.data || []);
      setWeekSummary(sumRes.data || null);
    } catch (error) {
      console.error('Error loading slot checklist:', error);
    }
  };

  useEffect(() => {
    if (!selectedBatch || editingId) return;
    const batchStudents = students.filter((s) => refToId(s.batch) === refToId(selectedBatch));
    setFormData((prev) => ({
      ...prev,
      presentStudents: batchStudents.map((s) => ({ studentId: s._id, present: false })),
    }));
  }, [selectedBatch, students, editingId]);

  useEffect(() => {
    if (!selectedBatch || editingId) return;
    const b = batches.find((x) => refToId(x._id) === refToId(selectedBatch));
    const tlist = teachersForBatch(b, teachers);
    if (tlist.length === 1) {
      setFormData((prev) => ({ ...prev, teacher: refToId(tlist[0]) }));
    }
  }, [selectedBatch, batches, teachers, editingId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classRes, batchRes, studentRes, teacherRes] = await Promise.all([
        classTrackingAPI.getByDate(selectedDate),
        batchAPI.getAll(),
        studentAPI.getAll(),
        teacherAPI.getAll(),
      ]);
      setClasses(classRes.data);
      setBatches(batchRes.data);
      setStudents(studentRes.data);
      setTeachers(teacherRes.data);
      await loadSlotExtrasFor(selectedDate);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateChange = async (e) => {
    const v = e.target.value;
    setSelectedDate(v);
    try {
      setLoading(true);
      const res = await classTrackingAPI.getByDate(v);
      setClasses(res.data);
      await loadSlotExtrasFor(v);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotMark = async (row, taken) => {
    try {
      await slotAttendanceAPI.upsert({
        batch: row.batchId,
        scheduleSlotId: row.scheduleSlotId,
        dateKey: row.dateKey || selectedDate,
        taken,
      });
      await loadSlotExtrasFor(row.dateKey || selectedDate);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teacher) {
      alert('Please select the teacher for this class.');
      return;
    }
    try {
      const payload = {
        batch: formData.batch,
        teacher: formData.teacher,
        teacherClassStatus: formData.teacherClassStatus,
        date: formData.date,
        topic: formData.topic,
        notes: formData.notes,
        presentStudents: formData.presentStudents,
      };
      if (editingId) {
        await classTrackingAPI.update(editingId, payload);
      } else {
        await classTrackingAPI.create(payload);
      }
      setFormData({
        batch: '',
        teacher: '',
        teacherClassStatus: 'taken',
        date: format(new Date(), 'yyyy-MM-dd'),
        topic: '',
        notes: '',
        presentStudents: [],
      });
      setEditingId(null);
      setShowForm(false);
      setSelectedBatch('');
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await classTrackingAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE');
  };

  const selectedBatchObj = batches.find((b) => refToId(b._id) === refToId(selectedBatch));
  const batchTeacherOptions = teachersForBatch(selectedBatchObj, teachers);

  const classesByBatch = useMemo(() => {
    const map = new Map();
    for (const cls of classes) {
      const bid = refToId(cls.batch);
      let name = typeof cls.batch === 'object' ? cls.batch?.name : null;
      let subject = typeof cls.batch === 'object' ? cls.batch?.subject : null;
      if (!name) name = batches.find((b) => refToId(b._id) === bid)?.name || 'Unknown batch';
      if (!subject) subject = batches.find((b) => refToId(b._id) === bid)?.subject;
      if (!map.has(bid)) map.set(bid, { batchId: bid, batchName: name, batchSubject: subject, items: [] });
      map.get(bid).items.push(cls);
    }
    return [...map.values()].sort((a, b) => a.batchName.localeCompare(b.batchName));
  }, [classes, batches]);

  if (loading && !classes.length && !batches.length) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Class Tracking</h1>
          <p className="text-gray-600">
            Timetable checklist by day, class attendance, and records grouped by batch
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setSelectedBatch('');
            setFormData({
              batch: '',
              teacher: '',
              teacherClassStatus: 'taken',
              date: format(new Date(), 'yyyy-MM-dd'),
              topic: '',
              notes: '',
              presentStudents: [],
            });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Mark Attendance
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">Select Date</label>
            <input type="date" value={selectedDate} onChange={handleDateChange} className="input-field" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-2">Day</p>
            <p className="text-xl font-bold text-primary">{getDayOfWeek(selectedDate)}</p>
          </div>
        </div>
      </div>

      {weekSummary && (
        <div className="card mb-6 bg-slate-50">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <ClipboardCheck className="text-primary" size={22} />
            This week: classes marked from timetable
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Week {weekSummary.weekStart} → {weekSummary.weekEnd}. Each &quot;Yes&quot; on the checklist below counts
            as one class taken for that teacher and batch.
          </p>
          {(weekSummary.summary || []).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-white">
                  <tr>
                    <th className="text-left px-4 py-2">Teacher</th>
                    <th className="text-left px-4 py-2">Classes marked (Yes)</th>
                    <th className="text-left px-4 py-2">Batches</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {weekSummary.summary.map((row) => (
                    <tr key={row.teacherId || row.teacherName} className="border-b">
                      <td className="px-4 py-2 font-medium">{row.teacherName}</td>
                      <td className="px-4 py-2">{row.takenCount}</td>
                      <td className="px-4 py-2 text-gray-700">{(row.batches || []).join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No checklist marks for this week yet. Use the table below.</p>
          )}
        </div>
      )}

      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <ClipboardCheck className="text-primary" size={22} />
          Timetable checklist for {selectedDate}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          One row per scheduled slot that falls on this weekday. <strong>Yes</strong> = teacher took this batch class
          today. <strong>No</strong> = did not take it. This drives the weekly counts above.
        </p>
        {slotChecklist.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2">Batch</th>
                  <th className="text-left px-3 py-2">Subject</th>
                  <th className="text-left px-3 py-2">Time</th>
                  <th className="text-left px-3 py-2">Teacher</th>
                  <th className="text-center px-3 py-2">Taken?</th>
                </tr>
              </thead>
              <tbody>
                {slotChecklist.map((row) => (
                  <tr key={`${row.batchId}-${row.scheduleSlotId}`} className="border-b border-gray-100">
                    <td className="px-3 py-2 font-medium">{row.batchName}</td>
                    <td className="px-3 py-2">{row.slotSubject}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {row.startTime}
                      {row.endTime ? ` – ${row.endTime}` : ''}
                    </td>
                    <td className="px-3 py-2">{row.teacherName}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSlotMark(row, true)}
                          className={`rounded px-3 py-1 text-xs font-semibold ${
                            row.taken === true ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSlotMark(row, false)}
                          className={`rounded px-3 py-1 text-xs font-semibold ${
                            row.taken === false ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No slots match this weekday. Add timetable slots (with day and time) on the Batches page.
          </p>
        )}
      </div>

      {showForm && (
        <div className="card mb-8 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6">Mark Class</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedBatch(v);
                    setFormData((prev) => ({ ...prev, batch: v, teacher: '' }));
                  }}
                  className="input-field"
                  required
                >
                  <option value="">-- Select Batch --</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={refToId(batch._id)}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Teacher for this session</label>
              <select
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                className="input-field"
                required
                disabled={!selectedBatch}
              >
                <option value="">-- Select teacher --</option>
                {batchTeacherOptions.map((t) => (
                  <option key={refToId(t)} value={refToId(t)}>
                    {t.name}
                  </option>
                ))}
              </select>
              {selectedBatch && batchTeacherOptions.length === 0 && (
                <p className="text-sm text-amber-700 mt-1">
                  No teachers on this batch yet. Add teachers on the Batches page first.
                </p>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <p className="font-semibold mb-2">Teacher class status</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="teacherClassStatus"
                    value="taken"
                    checked={formData.teacherClassStatus === 'taken'}
                    onChange={() => setFormData({ ...formData, teacherClassStatus: 'taken' })}
                  />
                  <span>Taken (class was held)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="teacherClassStatus"
                    value="not_taken"
                    checked={formData.teacherClassStatus === 'not_taken'}
                    onChange={() => setFormData({ ...formData, teacherClassStatus: 'not_taken' })}
                  />
                  <span>Not taken (teacher absent)</span>
                </label>
              </div>
            </div>

            <input
              type="text"
              placeholder="Class Topic"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="input-field"
            />

            <textarea
              placeholder="Class Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field h-24"
            />

            {selectedBatch && formData.teacherClassStatus === 'taken' && formData.presentStudents.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold mb-3">Student attendance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {formData.presentStudents.map((item, idx) => {
                    const student = students.find((s) => refToId(s._id) === refToId(item.studentId));
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.present}
                          onChange={(e) => {
                            const newPresent = [...formData.presentStudents];
                            newPresent[idx] = { ...newPresent[idx], present: e.target.checked };
                            setFormData({ ...formData, presentStudents: newPresent });
                          }}
                          className="w-4 h-4"
                        />
                        <label className="text-sm">{student?.name}</label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Save
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 className="text-2xl font-bold text-secondary mb-4">Class records by batch</h2>
      {classesByBatch.length > 0 ? (
        classesByBatch.map((group) => (
          <div key={group.batchId} className="card mb-6">
            <div className="mb-4 border-b border-gray-200 pb-3">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen size={22} className="text-primary" />
                {group.batchName}
              </h3>
              {group.batchSubject && (
                <p className="text-sm text-gray-600 mt-1">Batch subject: {group.batchSubject}</p>
              )}
            </div>
            <div className="space-y-4">
              {group.items.map((cls) => {
                const status = cls.teacherClassStatus || 'taken';
                const tname = typeof cls.teacher === 'object' ? cls.teacher?.name : '—';
                return (
                  <div
                    key={cls._id}
                    className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 md:flex md:justify-between md:gap-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{format(new Date(cls.date), 'PPP')}</p>
                      <p className="mt-1">
                        <span className={status === 'taken' ? 'badge-success' : 'badge-danger'}>
                          {status === 'taken' ? 'Taken' : 'Not taken'}
                        </span>
                        <span className="ml-2 font-semibold text-gray-800">Teacher: {tname}</span>
                      </p>
                      <p className="text-sm mt-2">
                        <strong>Topic:</strong> {cls.topic || '—'}
                      </p>
                      <p className="text-sm">
                        <strong>Notes:</strong> {cls.notes || '—'}
                      </p>
                      {status === 'taken' && (
                        <p className="text-sm mt-1">
                          <strong>Present:</strong>{' '}
                          {cls.presentStudents?.filter((s) => s.present).length || 0} /{' '}
                          {cls.presentStudents?.length || 0}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3 md:mt-0 md:flex-col md:items-end">
                      <button
                        onClick={() => {
                          const bid = refToId(cls.batch);
                          setEditingId(cls._id);
                          setSelectedBatch(bid);
                          setFormData({
                            batch: bid,
                            teacher: refToId(cls.teacher),
                            teacherClassStatus: cls.teacherClassStatus || 'taken',
                            date: cls.date
                              ? format(new Date(cls.date), 'yyyy-MM-dd')
                              : format(new Date(), 'yyyy-MM-dd'),
                            topic: cls.topic || '',
                            notes: cls.notes || '',
                            presentStudents: (cls.presentStudents || []).map((p) => ({
                              studentId: refToId(p.studentId),
                              present: !!p.present,
                            })),
                          });
                          setShowForm(true);
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cls._id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="card text-center">
          <p className="text-gray-500">No class records for this date</p>
        </div>
      )}
    </div>
  );
};

export default ClassTracking;
