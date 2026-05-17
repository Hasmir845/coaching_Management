import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    if (user?.uid) {
      fetchTeacherData();
    }
  }, [user]);

  const fetchTeacherData = async () => {
    if (!user?.uid) {
      return;
    }

    try {
      setLoading(true);

      // Fetch current user's teacher info
      const userResponse = await api.get('/admin/me', {
        headers: { 'x-firebase-uid': user.uid },
      });

      if (!userResponse.data.teacher) {
        setClasses([]);
        setError('You are not approved as a teacher yet.');
        return;
      }

      const teacherId = String(userResponse.data.teacher._id);

      // Fetch class tracking for today
      const today = new Date().toISOString().split('T')[0];
      const classesResponse = await api.get('/class-tracking', {
        headers: { 'x-firebase-uid': user.uid },
      });

      const todayClasses = classesResponse.data.filter((c) => {
        const classDate = c.date ? String(c.date).split('T')[0] : null;
        const classTeacherId = c.teacher?._id || c.teacher;
        const batchTeacherId = c.batch?.teacher?._id || c.batch?.teacher;
        const batchTeachers = Array.isArray(c.batch?.teachers)
          ? c.batch.teachers.map((t) => String(t._id || t))
          : [];

        return (
          classDate === today &&
          (String(classTeacherId) === teacherId ||
            String(batchTeacherId) === teacherId ||
            batchTeachers.includes(teacherId))
        );
      });

      setClasses(todayClasses);
      setError('');
    } catch (err) {
      console.error('Error fetching teacher data:', err);
      setError('Failed to load your classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (classId, status) => {
    if (!user?.uid) return;

    try {
      // Mark attendance for class
      await api.put(
        '/class-tracking/' + classId,
        { teacherClassStatus: status === 'present' ? 'taken' : 'not_taken' },
        {
          headers: { 'x-firebase-uid': user.uid },
        }
      );

      setAttendance({ ...attendance, [classId]: status });
      fetchTeacherData();
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to mark attendance');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Class Tracking</h1>
          <p className="text-gray-600 mt-2">View today's class tracking records and mark attendance</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Today's Classes</h2>
              </div>

              {classes.length === 0 ? (
                <div className="p-6 text-center text-gray-600">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No classes scheduled for today</p>
                </div>
              ) : (
                <div className="divide-y">
                  {classes.map((classItem) => (
                    <div
                      key={classItem._id}
                      className="p-6 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {classItem.batch?.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                          {classItem.time && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {classItem.time}
                            </div>
                          )}
                          <div>
                            {classItem.batch?.subject}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAttendance(classItem._id, 'present')}
                          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                            attendance[classItem._id] === 'present'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Yes
                        </button>
                        <button
                          onClick={() => handleAttendance(classItem._id, 'absent')}
                          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                            attendance[classItem._id] === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
