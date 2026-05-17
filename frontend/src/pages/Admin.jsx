import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, adminAPI } from '../services/api';
import { UserPlus, Trash2, Shield, Users } from 'lucide-react';

function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchUsers();
    fetchTeachers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        headers: { 'x-firebase-uid': user.uid },
      });
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/admin/teachers', {
        headers: { 'x-firebase-uid': user.uid },
      });
      setTeachers(response.data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      await api.post(
        `/admin/users/${userId}/make-admin`,
        {},
        { headers: { 'x-firebase-uid': user.uid } }
      );
      fetchUsers();
    } catch (err) {
      console.error('Error promoting user:', err);
      setError('Failed to promote user');
    }
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      await api.post(
        `/admin/users/${userId}/remove-admin`,
        {},
        { headers: { 'x-firebase-uid': user.uid } }
      );
      fetchUsers();
    } catch (err) {
      console.error('Error removing admin:', err);
      setError('Failed to remove admin');
    }
  };

  const handleApproveRequest = async (userId) => {
    try {
      await api.post(
        `/admin/users/${userId}/approve-admin`,
        {},
        { headers: { 'x-firebase-uid': user.uid } }
      );
      fetchUsers();
    } catch (err) {
      console.error('Error approving admin request:', err);
      setError('Failed to approve admin request');
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await api.post(
        `/admin/users/${userId}/reject-admin`,
        {},
        { headers: { 'x-firebase-uid': user.uid } }
      );
      fetchUsers();
    } catch (err) {
      console.error('Error rejecting admin request:', err);
      setError('Failed to reject admin request');
    }
  };

  const handleApproveTeacherRequest = async (userId) => {
    try {
      await api.post(
        `/admin/users/${userId}/approve-teacher`,
        {},
        { headers: { 'x-firebase-uid': user.uid } }
      );
      fetchUsers();
    } catch (err) {
      console.error('Error approving teacher request:', err);
      setError('Failed to approve teacher request');
    }
  };

  const handleRejectTeacherRequest = async (userId) => {
    try {
      await api.post(
        `/admin/users/${userId}/reject-teacher`,
        {},
        { headers: { 'x-firebase-uid': user.uid } }
      );
      fetchUsers();
    } catch (err) {
      console.error('Error rejecting teacher request:', err);
      setError('Failed to reject teacher request');
    }
  };

  const handleClearAdminRequest = async (userId) => {
    try {
      await api.post(
        `/admin/users/${userId}/clear-admin-request`,
        {},
        { headers: { 'x-firebase-uid': user.uid } }
      );
      fetchUsers();
    } catch (err) {
      console.error('Error clearing admin request:', err);
      setError('Failed to clear admin request');
    }
  };

  const handleClearTeacherRequest = async (userId) => {
    try {
      await api.post(
        `/admin/users/${userId}/clear-teacher-request`,
        {},
        { headers: { 'x-firebase-uid': user.uid } }
      );
      fetchUsers();
    } catch (err) {
      console.error('Error clearing teacher request:', err);
      setError('Failed to clear teacher request');
    }
  };

  const handleRemoveTeacher = async (userId) => {
    if (window.confirm('Remove teacher role and delete teacher profile?')) {
      try {
        await api.post(
          `/admin/users/${userId}/remove-teacher`,
          {},
          { headers: { 'x-firebase-uid': user.uid } }
        );
        fetchUsers();
        fetchTeachers();
      } catch (err) {
        console.error('Error removing teacher:', err);
        setError('Failed to remove teacher');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`, {
          headers: { 'x-firebase-uid': user.uid },
        });
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage users, admins, and teachers</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            All Users
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'teachers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            <Shield className="w-5 h-5 inline mr-2" />
            Teachers
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Admin Request
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Teacher Request
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody divide-y>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.displayName || '-'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            u.isAdmin
                              ? 'bg-blue-100 text-blue-800'
                              : u.role === 'teacher'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.isAdmin ? 'Admin' : u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {u.lastSeenAt ? (
                          Date.now() - new Date(u.lastSeenAt).getTime() < 5 * 60 * 1000
                            ? 'Online'
                            : new Date(u.lastSeenAt).toLocaleString()
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            u.adminRequestStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : u.adminRequestStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.adminRequestStatus === 'none' ? 'None' : u.adminRequestStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            u.teacherRequestStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : u.teacherRequestStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : u.teacherRequestStatus === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.teacherRequestStatus === 'none' ? 'None' : u.teacherRequestStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          {u.adminRequestStatus === 'pending' && !u.isAdmin && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(u._id)}
                                className="rounded-full bg-green-600 px-3 py-1 text-white text-xs font-semibold hover:bg-green-700"
                              >
                                Approve Admin
                              </button>
                              <button
                                onClick={() => handleRejectRequest(u._id)}
                                className="rounded-full bg-orange-600 px-3 py-1 text-white text-xs font-semibold hover:bg-orange-700"
                              >
                                Reject Admin
                              </button>
                            </>
                          )}

                          {u.adminRequestStatus !== 'none' && u.adminRequestStatus !== 'approved' && !u.isAdmin && (
                            <button
                              onClick={() => handleClearAdminRequest(u._id)}
                              className="rounded-full bg-slate-600 px-3 py-1 text-white text-xs font-semibold hover:bg-slate-700"
                            >
                              Clear Admin Request
                            </button>
                          )}

                          {u.teacherRequestStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveTeacherRequest(u._id)}
                                className="rounded-full bg-green-600 px-3 py-1 text-white text-xs font-semibold hover:bg-green-700"
                              >
                                Approve Teacher
                              </button>
                              <button
                                onClick={() => handleRejectTeacherRequest(u._id)}
                                className="rounded-full bg-orange-600 px-3 py-1 text-white text-xs font-semibold hover:bg-orange-700"
                              >
                                Reject Teacher
                              </button>
                            </>
                          )}

                          {u.teacherRequestStatus !== 'none' && u.teacherRequestStatus !== 'approved' && (
                            <button
                              onClick={() => handleClearTeacherRequest(u._id)}
                              className="rounded-full bg-slate-600 px-3 py-1 text-white text-xs font-semibold hover:bg-slate-700"
                            >
                              Clear Teacher Request
                            </button>
                          )}

                          {!u.isAdmin && (
                            <button
                              onClick={() => handleMakeAdmin(u._id)}
                              className="rounded-full bg-blue-600 px-3 py-1 text-white text-xs font-semibold hover:bg-blue-700"
                            >
                              <Shield className="w-4 h-4 inline mr-1" />
                              Make Admin
                            </button>
                          )}

                          {u.isAdmin && (
                            <button
                              onClick={() => handleRemoveAdmin(u._id)}
                              className="rounded-full bg-yellow-600 px-3 py-1 text-white text-xs font-semibold hover:bg-yellow-700"
                            >
                              Remove Admin
                            </button>
                          )}

                          {u.role === 'teacher' && (
                            <button
                              onClick={() => handleRemoveTeacher(u._id)}
                              className="rounded-full bg-purple-600 px-3 py-1 text-white text-xs font-semibold hover:bg-purple-700"
                            >
                              Remove Teacher
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="rounded-full bg-red-600 px-3 py-1 text-white text-xs font-semibold hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4 inline mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Teachers</h2>
            {teachers.length === 0 ? (
              <p className="text-gray-600">No teachers found</p>
            ) : (
              <div className="grid gap-4">
                {teachers.map((t) => (
                  <div key={t._id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{t.teacher?.name || t.displayName || t.email}</h3>
                        <p className="text-sm text-gray-600">{t.email}</p>
                        {t.teacher && (
                          <div className="mt-2 text-sm text-gray-600 space-y-1">
                            <p>Subject: {t.teacher.subject}</p>
                            <p>Status: {t.teacher.status || 'active'}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {!t.isAdmin && (
                          <button
                            onClick={() => handleMakeAdmin(t._id)}
                            className="rounded-full bg-blue-600 px-3 py-1 text-white text-xs font-semibold hover:bg-blue-700"
                          >
                            Make Admin
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveTeacher(t._id)}
                          className="rounded-full bg-purple-600 px-3 py-1 text-white text-xs font-semibold hover:bg-purple-700"
                        >
                          Remove Teacher
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
