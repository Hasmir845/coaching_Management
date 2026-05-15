import React, { useState, useEffect } from 'react';
import { batchAPI, teacherAPI, studentAPI } from '../services/api';
import { Plus, Edit2, Trash2, Search, Users } from 'lucide-react';
import { refToId } from '../utils/refs';
import { formatApiError } from '../utils/apiError';
import LoadErrorBanner from '../components/LoadErrorBanner';
import PageLoader from '../components/PageLoader';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const emptySlot = () => ({
  dayOfWeek: 'Monday',
  startTime: '',
  endTime: '',
  subject: '',
  teacher: '',
});

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    schedule: '',
    scheduleSlots: [],
    startDate: '',
    endDate: '',
    capacity: '',
    teachers: [],
    status: 'active',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = batches.filter(
      (batch) =>
        batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBatches(filtered);
  }, [searchTerm, batches]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [batchRes, teacherRes, studentRes] = await Promise.all([
        batchAPI.getAll(),
        teacherAPI.getAll(),
        studentAPI.getAll(),
      ]);
      setBatches(batchRes.data);
      setTeachers(teacherRes.data);
      setStudents(studentRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoadError(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const teacherIdsFromBatch = (batch) => {
    const fromArr = (batch.teachers || []).map((t) => refToId(t)).filter(Boolean);
    if (fromArr.length) return fromArr;
    const legacy = refToId(batch.teacher);
    return legacy ? [legacy] : [];
  };

  const teacherNamesForBatch = (batch) => {
    const ids = teacherIdsFromBatch(batch);
    if (!ids.length) return 'Unassigned';
    return ids
      .map((id) => teachers.find((t) => refToId(t) === id)?.name || '—')
      .join(', ');
  };

  const toggleTeacherInForm = (teacherId) => {
    setFormData((prev) => {
      const set = new Set(prev.teachers);
      if (set.has(teacherId)) set.delete(teacherId);
      else set.add(teacherId);
      return { ...prev, teachers: [...set] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        subject: formData.subject,
        schedule: formData.schedule || undefined,
        scheduleSlots: (formData.scheduleSlots || [])
          .filter((s) => s.dayOfWeek && s.startTime)
          .map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime || undefined,
            subject: (s.subject || '').trim() || undefined,
            teacher: s.teacher || undefined,
          })),
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        capacity: formData.capacity === '' ? undefined : Number(formData.capacity),
        teachers: formData.teachers,
        status: formData.status,
      };

      if (editingId) {
        await batchAPI.update(editingId, payload);
      } else {
        await batchAPI.create(payload);
      }
      setFormData({
        name: '',
        subject: '',
        schedule: '',
        scheduleSlots: [],
        startDate: '',
        endDate: '',
        capacity: '',
        teachers: [],
        status: 'active',
      });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleEdit = (batch) => {
    const slots = (batch.scheduleSlots || []).map((s) => ({
      dayOfWeek: s.dayOfWeek || 'Monday',
      startTime: s.startTime || '',
      endTime: s.endTime || '',
      subject: s.subject || '',
      teacher: refToId(s.teacher),
    }));
    setFormData({
      name: batch.name,
      subject: batch.subject,
      schedule: batch.schedule || '',
      scheduleSlots: slots.length ? slots : [],
      startDate: batch.startDate ? String(batch.startDate).slice(0, 10) : '',
      endDate: batch.endDate ? String(batch.endDate).slice(0, 10) : '',
      capacity: batch.capacity != null ? String(batch.capacity) : '',
      teachers: teacherIdsFromBatch(batch),
      status: batch.status || 'active',
    });
    setEditingId(batch._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await batchAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting batch:', error);
      }
    }
  };

  const getBatchStudents = (batchId) => {
    const bid = refToId(batchId);
    return students.filter((s) => refToId(s.batch) === bid);
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="p-4 md:p-8">
      {loadError ? <LoadErrorBanner message={loadError} onRetry={fetchData} /> : null}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Batches</h1>
          <p className="text-gray-600">Manage your class batches</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              subject: '',
              schedule: '',
              scheduleSlots: [],
              startDate: '',
              endDate: '',
              capacity: '',
              teachers: [],
              status: 'active',
            });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Batch
        </button>
      </div>

      <div className="mb-6">
        <div className="search-field-wrap">
          <span className="search-icon-wrap">
            <Search size={18} strokeWidth={2} />
          </span>
          <input
            type="text"
            placeholder="Search by name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {showForm && (
        <div className="card mb-8 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Batch' : 'Add New Batch'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Batch Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="Schedule notes (optional summary)"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="input-field md:col-span-2"
              />
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field"
              />
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input-field"
              />
              <input
                type="number"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="input-field"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <p className="font-semibold mb-2">Teachers for this batch</p>
              <p className="text-sm text-gray-600 mb-3">Select one or more teachers.</p>
              <div className="flex flex-wrap gap-3">
                {teachers.map((t) => {
                  const id = refToId(t);
                  const checked = formData.teachers.includes(id);
                  return (
                    <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTeacherInForm(id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      {t.name}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-semibold">Weekly timetable (dashboard)</p>
                  <p className="text-sm text-gray-600">Day, time, subject, and teacher for each slot.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduleSlots: [...(prev.scheduleSlots || []), emptySlot()],
                    }))
                  }
                  className="btn-secondary text-sm"
                >
                  + Add slot
                </button>
              </div>
              <div className="space-y-3">
                {(formData.scheduleSlots || []).length === 0 && (
                  <p className="text-sm text-gray-500">No slots yet. Add one to show on the dashboard.</p>
                )}
                {(formData.scheduleSlots || []).map((slot, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border-b border-gray-100 pb-3"
                  >
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Day</label>
                      <select
                        value={slot.dayOfWeek}
                        onChange={(e) => {
                          const next = [...formData.scheduleSlots];
                          next[idx] = { ...next[idx], dayOfWeek: e.target.value };
                          setFormData({ ...formData, scheduleSlots: next });
                        }}
                        className="input-field"
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Start</label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => {
                          const next = [...formData.scheduleSlots];
                          next[idx] = { ...next[idx], startTime: e.target.value };
                          setFormData({ ...formData, scheduleSlots: next });
                        }}
                        className="input-field"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">End</label>
                      <input
                        type="time"
                        value={slot.endTime || ''}
                        onChange={(e) => {
                          const next = [...formData.scheduleSlots];
                          next[idx] = { ...next[idx], endTime: e.target.value };
                          setFormData({ ...formData, scheduleSlots: next });
                        }}
                        className="input-field"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Subject (this class)</label>
                      <input
                        type="text"
                        placeholder={`Default: ${formData.subject || 'batch subject'}`}
                        value={slot.subject || ''}
                        onChange={(e) => {
                          const next = [...formData.scheduleSlots];
                          next[idx] = { ...next[idx], subject: e.target.value };
                          setFormData({ ...formData, scheduleSlots: next });
                        }}
                        className="input-field"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Teacher</label>
                      <select
                        value={slot.teacher}
                        onChange={(e) => {
                          const next = [...formData.scheduleSlots];
                          next[idx] = { ...next[idx], teacher: e.target.value };
                          setFormData({ ...formData, scheduleSlots: next });
                        }}
                        className="input-field"
                      >
                        <option value="">—</option>
                        {teachers.map((t) => (
                          <option key={refToId(t)} value={refToId(t)}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-1 flex md:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const next = formData.scheduleSlots.filter((_, i) => i !== idx);
                          setFormData({ ...formData, scheduleSlots: next });
                        }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update' : 'Create'} Batch
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => (
          <div key={batch._id} className="card hover:shadow-lg transition duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{batch.name}</h3>
                <p className="text-sm text-gray-600">{batch.subject}</p>
              </div>
              <span className={batch.status === 'active' ? 'badge-success' : 'badge-warning'}>
                {batch.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <p>
                <strong>Schedule:</strong> {batch.schedule || '—'}
              </p>
              <p>
                <strong>Capacity:</strong> {batch.capacity ?? '—'}
              </p>
              <p>
                <strong>Teachers:</strong> {teacherNamesForBatch(batch)}
              </p>
              {(batch.scheduleSlots || []).length > 0 && (
                <div className="mt-2">
                  <strong className="block mb-1">Slots:</strong>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {batch.scheduleSlots.map((s) => {
                      const subj = (s.subject && String(s.subject).trim()) || batch.subject;
                      return (
                        <li key={s._id || `${s.dayOfWeek}-${s.startTime}`}>
                          {s.dayOfWeek} {s.startTime}
                          {s.endTime ? `–${s.endTime}` : ''}
                          {subj ? ` · ${subj}` : ''}
                          {s.teacher?.name ? ` · ${s.teacher.name}` : ''}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 py-3 border-y text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>{getBatchStudents(batch._id).length} students</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(batch)}
                className="flex-1 p-2 text-blue-500 hover:bg-blue-100 rounded transition"
              >
                <Edit2 size={18} className="mx-auto" />
              </button>
              <button
                onClick={() => handleDelete(batch._id)}
                className="flex-1 p-2 text-red-500 hover:bg-red-100 rounded transition"
              >
                <Trash2 size={18} className="mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBatches.length === 0 && (
        <div className="card text-center">
          <p className="text-gray-500">No batches found</p>
        </div>
      )}
    </div>
  );
};

export default Batches;
