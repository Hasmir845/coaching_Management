import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../services/api';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { formatApiError } from '../utils/apiError';
import LoadErrorBanner from '../components/LoadErrorBanner';
import PageLoader from '../components/PageLoader';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    phone: '',
    email: '',
    joiningDate: '',
    status: 'active',
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    const filtered = teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [searchTerm, teachers]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const res = await teacherAPI.getAll();
      setTeachers(res.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setLoadError(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await teacherAPI.update(editingId, formData);
      } else {
        await teacherAPI.create(formData);
      }
      setFormData({
        name: '',
        subject: '',
        phone: '',
        email: '',
        joiningDate: '',
        status: 'active',
      });
      setEditingId(null);
      setShowForm(false);
      fetchTeachers();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (teacher) => {
    setFormData(teacher);
    setEditingId(teacher._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teacherAPI.delete(id);
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="p-4 md:p-8">
      {loadError ? <LoadErrorBanner message={loadError} onRetry={fetchTeachers} /> : null}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Teachers</h1>
          <p className="text-gray-600">Manage your teaching staff</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              subject: '',
              phone: '',
              email: '',
              joiningDate: '',
              status: 'active',
            });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Teacher
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="search-field-wrap">
          <span className="search-icon-wrap">
            <Search size={18} strokeWidth={2} />
          </span>
          <input
            type="text"
            placeholder="Search by name, subject, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-8 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? 'Edit Teacher' : 'Add New Teacher'}
          </h2>
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
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
              />
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="input-field"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="leave">On Leave</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update' : 'Create'} Teacher
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="w-full">
          <thead className="bg-secondary text-white">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Subject</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-left">Joining Date</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredTeachers.map((teacher) => (
              <tr key={teacher._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{teacher.name}</td>
                <td className="px-6 py-4">{teacher.subject}</td>
                <td className="px-6 py-4">{teacher.email}</td>
                <td className="px-6 py-4">{teacher.phone}</td>
                <td className="px-6 py-4">
                  {new Date(teacher.joiningDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      teacher.status === 'active'
                        ? 'badge-success'
                        : teacher.status === 'inactive'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}
                  >
                    {teacher.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="p-2 text-blue-500 hover:bg-blue-100 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher._id)}
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

      {filteredTeachers.length === 0 && (
        <div className="card text-center">
          <p className="text-gray-500">No teachers found</p>
        </div>
      )}
    </div>
  );
};

export default Teachers;
