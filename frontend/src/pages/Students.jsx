import React, { useState, useEffect } from 'react';
import { studentAPI, batchAPI } from '../services/api';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { refToId } from '../utils/refs';
import { formatApiError } from '../utils/apiError';
import LoadErrorBanner from '../components/LoadErrorBanner';
import PageLoader from '../components/PageLoader';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    batchName: '',
    enrollmentDate: '',
    status: 'active',
  });

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, []);

  useEffect(() => {
    const filtered = students.filter((student) => {
      const email = student.email || '';
      return (
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const res = await studentAPI.getAll();
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoadError(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await batchAPI.getAll();
      setBatches(res.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bn = (formData.batchName || '').trim();
    if (!bn) {
      alert('Please enter the batch name so the student is assigned to the correct batch.');
      return;
    }
    try {
      const body = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone,
        batchName: bn,
        enrollmentDate: formData.enrollmentDate || undefined,
        status: formData.status,
      };
      if (editingId) {
        await studentAPI.update(editingId, body);
      } else {
        await studentAPI.create(body);
      }
      setFormData({
        name: '',
        email: '',
        phone: '',
        batchName: '',
        enrollmentDate: '',
        status: 'active',
      });
      setEditingId(null);
      setShowForm(false);
      fetchStudents();
      fetchBatches();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleEdit = (student) => {
    const batchName =
      (typeof student.batch === 'object' && student.batch?.name) ||
      batches.find((b) => refToId(b._id) === refToId(student.batch))?.name ||
      '';
    setFormData({
      name: student.name,
      email: student.email || '',
      phone: student.phone || '',
      batchName,
      enrollmentDate: student.enrollmentDate
        ? String(student.enrollmentDate).slice(0, 10)
        : '',
      status: student.status || 'active',
    });
    setEditingId(student._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentAPI.delete(id);
        fetchStudents();
        fetchBatches();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const batchLabel = (student) => {
    if (student.batch && typeof student.batch === 'object') return student.batch.name;
    const id = refToId(student.batch);
    return batches.find((b) => refToId(b._id) === id)?.name || 'N/A';
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="p-4 md:p-8">
      {loadError ? <LoadErrorBanner message={loadError} onRetry={fetchStudents} /> : null}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Students</h1>
          <p className="text-gray-600">Manage your students</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              batchName: '',
              enrollmentDate: '',
              status: 'active',
            });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Student
        </button>
      </div>

      <div className="mb-6">
        <div className="search-field-wrap">
          <span className="search-icon-wrap">
            <Search size={18} strokeWidth={2} />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {showForm && (
        <div className="card mb-8 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Student' : 'Add New Student'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
              />
              <div>
                <label className="block text-sm font-semibold mb-2">Batch name</label>
                <input
                  type="text"
                  list="batch-name-options"
                  placeholder="Exact batch name (must match a batch)"
                  value={formData.batchName}
                  onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                  className="input-field"
                  required
                />
                <datalist id="batch-name-options">
                  {batches.map((b) => (
                    <option key={b._id} value={b.name} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">
                  Type or pick a name; the student is linked to that batch automatically (case-insensitive match).
                </p>
              </div>
              <input
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                className="input-field"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update' : 'Create'} Student
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="w-full">
          <thead className="bg-secondary text-white">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-left">Batch</th>
              <th className="px-6 py-3 text-left">Enrollment Date</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredStudents.map((student) => (
              <tr key={student._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{student.name}</td>
                <td className="px-6 py-4">{student.email || 'N/A'}</td>
                <td className="px-6 py-4">{student.phone}</td>
                <td className="px-6 py-4">{batchLabel(student)}</td>
                <td className="px-6 py-4">
                  {student.enrollmentDate
                    ? new Date(student.enrollmentDate).toLocaleDateString()
                    : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={student.status === 'active' ? 'badge-success' : 'badge-danger'}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="p-2 text-blue-500 hover:bg-blue-100 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(student._id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="card text-center">
          <p className="text-gray-500">No students found</p>
        </div>
      )}
    </div>
  );
};

export default Students;
