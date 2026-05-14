import React, { useState, useEffect, useCallback } from 'react';
import { dashboardAPI, slotAttendanceAPI } from '../services/api';
import {
  Users,
  BookOpen,
  Users2,
  Clock,
  AlertCircle,
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Table2,
} from 'lucide-react';
import { format, startOfWeek, parseISO, startOfMonth } from 'date-fns';

function mondayOfDateKey(dateKey) {
  return format(startOfWeek(parseISO(dateKey), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

function shiftWeekMonday(weekMonday, deltaWeeks) {
  const d = parseISO(weekMonday);
  d.setDate(d.getDate() + deltaWeeks * 7);
  return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [notHeldClasses, setNotHeldClasses] = useState([]);
  const [schedulePayload, setSchedulePayload] = useState({ rows: [], weekStart: '', weekEnd: '' });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registerStart, setRegisterStart] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [registerEnd, setRegisterEnd] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [classRegister, setClassRegister] = useState({
    register: [],
    teacherCounts: [],
    totalClasses: 0,
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [timetableWeekStart, setTimetableWeekStart] = useState(() =>
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, classesRes, notHeldRes, scheduleRes, activitiesRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getTodayClasses(),
        dashboardAPI.getAbsentTeachers(),
        dashboardAPI.getWeeklySchedule(timetableWeekStart),
        dashboardAPI.getRecentActivities(),
      ]);

      setStats(statsRes.data);
      setTodayClasses(classesRes.data);
      setNotHeldClasses(notHeldRes.data);
      const sched = scheduleRes.data;
      if (sched && Array.isArray(sched.rows)) {
        setSchedulePayload({
          rows: sched.rows,
          weekStart: sched.weekStart,
          weekEnd: sched.weekEnd,
        });
      } else {
        setSchedulePayload({ rows: Array.isArray(sched) ? sched : [], weekStart: '', weekEnd: '' });
      }
      setRecentActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [timetableWeekStart]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchClassRegister = useCallback(async () => {
    try {
      setRegisterLoading(true);
      const res = await slotAttendanceAPI.getTakenRegister({
        startDate: registerStart,
        endDate: registerEnd,
      });
      setClassRegister({
        register: res.data?.register || [],
        teacherCounts: res.data?.teacherCounts || [],
        totalClasses: res.data?.totalClasses ?? 0,
      });
    } catch (error) {
      console.error('Error fetching class register:', error);
    } finally {
      setRegisterLoading(false);
    }
  }, [registerStart, registerEnd]);

  useEffect(() => {
    fetchClassRegister();
  }, [fetchClassRegister]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold text-primary">Loading...</div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="card bg-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={32} className="text-white" />
        </div>
      </div>
    </div>
  );

  const weekLabel =
    schedulePayload.weekStart && schedulePayload.weekEnd
      ? `${schedulePayload.weekStart} → ${schedulePayload.weekEnd}`
      : '';

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <img
          src="/coaching-logo.svg"
          alt=""
          width={48}
          height={48}
          className="rounded-xl shadow-md ring-1 ring-gray-200 shrink-0"
        />
        <div>
          <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
          <p className="text-gray-600">Welcome back to Coaching Management System</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Teachers"
          value={stats?.totalTeachers || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users2}
          title="Total Students"
          value={stats?.totalStudents || 0}
          color="bg-green-500"
        />
        <StatCard
          icon={BookOpen}
          title="Total Batches"
          value={stats?.totalBatches || 0}
          color="bg-purple-500"
        />
      </div>

      <div className="card mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={24} className="text-primary" />
            <h2 className="text-2xl font-bold">Weekly timetable</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTimetableWeekStart((w) => shiftWeekMonday(w, -1))}
              className="btn-secondary flex items-center gap-1 px-3 py-2"
            >
              <ChevronLeft size={18} /> Prev week
            </button>
            <button
              type="button"
              onClick={() => setTimetableWeekStart((w) => shiftWeekMonday(w, 1))}
              className="btn-secondary flex items-center gap-1 px-3 py-2"
            >
              Next week <ChevronRight size={18} />
            </button>
            <label className="text-sm text-gray-600 flex items-center gap-2">
              Week of
              <input
                type="date"
                value={timetableWeekStart}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) setTimetableWeekStart(mondayOfDateKey(v));
                }}
                className="input-field w-auto min-w-[10rem]"
              />
            </label>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          Each row is a scheduled slot: <strong>calendar date</strong>, <strong>teacher</strong>, and{' '}
          <strong>subject</strong> (slot subject, or batch default). Configure slots under Batches.
        </p>
        {weekLabel && <p className="text-xs text-gray-500 mb-4">{weekLabel}</p>}
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          {schedulePayload.rows.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-left px-3 py-2">Day</th>
                  <th className="text-left px-3 py-2">Time</th>
                  <th className="text-left px-3 py-2">Batch</th>
                  <th className="text-left px-3 py-2">Subject</th>
                  <th className="text-left px-3 py-2">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {schedulePayload.rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {row.displayDate || row.calendarDate}
                      {row.calendarDate && (
                        <span className="block text-xs text-gray-500">{row.calendarDate}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium">{row.dayOfWeek}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {row.startTime}
                      {row.endTime ? ` – ${row.endTime}` : ''}
                    </td>
                    <td className="px-3 py-2">{row.batchName}</td>
                    <td className="px-3 py-2 text-gray-800">{row.subject}</td>
                    <td className="px-3 py-2">{row.teacherName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No timetable slots yet. Add slots when creating or editing a batch.</p>
          )}
        </div>
      </div>

      <div className="card mb-8 border-2 border-primary/15 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Table2 size={26} className="text-primary" />
              <h2 className="text-2xl font-bold text-secondary">Teacher class register</h2>
            </div>
            <p className="text-sm text-gray-600 mt-2 max-w-3xl">
              Spreadsheet-style log: every time you mark <strong>Yes</strong> on the timetable checklist in Class
              Tracking, a row appears here with the <strong>date</strong>, <strong>teacher</strong>,{' '}
              <strong>subject</strong>, <strong>batch</strong>, and <strong>time</strong>. Use the date range to
              filter.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-xs font-semibold text-gray-600 flex flex-col gap-1">
              From
              <input
                type="date"
                value={registerStart}
                onChange={(e) => setRegisterStart(e.target.value)}
                className="input-field w-auto min-w-[10rem]"
              />
            </label>
            <label className="text-xs font-semibold text-gray-600 flex flex-col gap-1">
              To
              <input
                type="date"
                value={registerEnd}
                onChange={(e) => setRegisterEnd(e.target.value)}
                className="input-field w-auto min-w-[10rem]"
              />
            </label>
            <button type="button" onClick={() => fetchClassRegister()} className="btn-secondary text-sm h-10 px-3">
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">
            Total classes (Yes):{' '}
            <span className="text-primary">{registerLoading ? '…' : classRegister.totalClasses}</span>
          </span>
          {classRegister.teacherCounts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {classRegister.teacherCounts.map((t) => (
                <span
                  key={t.teacherName}
                  className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-900 ring-1 ring-blue-100"
                >
                  {t.teacherName}: <strong className="ml-1">{t.classCount}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-[28rem] overflow-y-auto">
          {registerLoading ? (
            <p className="p-6 text-gray-500 text-sm">Loading register…</p>
          ) : classRegister.register.length > 0 ? (
            <table className="w-full text-sm border-collapse">
              <thead className="bg-secondary text-white sticky top-0 z-10">
                <tr>
                  <th className="text-left px-3 py-2.5 border-b border-gray-600 font-semibold">#</th>
                  <th className="text-left px-3 py-2.5 border-b border-gray-600 font-semibold">Date</th>
                  <th className="text-left px-3 py-2.5 border-b border-gray-600 font-semibold">Teacher</th>
                  <th className="text-left px-3 py-2.5 border-b border-gray-600 font-semibold">Subject (class)</th>
                  <th className="text-left px-3 py-2.5 border-b border-gray-600 font-semibold">Batch</th>
                  <th className="text-left px-3 py-2.5 border-b border-gray-600 font-semibold">Day</th>
                  <th className="text-left px-3 py-2.5 border-b border-gray-600 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {classRegister.register.map((row, idx) => (
                  <tr
                    key={row._id || idx}
                    className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/80 hover:bg-gray-100/80'}
                  >
                    <td className="px-3 py-2 border-b border-gray-100 text-gray-500">{idx + 1}</td>
                    <td className="px-3 py-2 border-b border-gray-100 whitespace-nowrap font-medium">
                      {row.dateKey}
                    </td>
                    <td className="px-3 py-2 border-b border-gray-100">{row.teacherName}</td>
                    <td className="px-3 py-2 border-b border-gray-100">{row.subject}</td>
                    <td className="px-3 py-2 border-b border-gray-100">{row.batchName}</td>
                    <td className="px-3 py-2 border-b border-gray-100 text-gray-600">{row.dayOfWeek}</td>
                    <td className="px-3 py-2 border-b border-gray-100 whitespace-nowrap text-gray-700">
                      {row.startTime}
                      {row.endTime ? ` – ${row.endTime}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-6 text-gray-500 text-sm">
              No checklist marks in this range yet. Go to <strong>Class Tracking</strong>, pick a date, and mark{' '}
              <strong>Yes</strong> on timetable rows.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={24} className="text-primary" />
            <h2 className="text-2xl font-bold">Today&apos;s classes (taken)</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            From Class Tracking with status &quot;Taken&quot; for today.
          </p>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todayClasses.length > 0 ? (
              todayClasses.map((cls) => (
                <div key={cls._id} className="border-l-4 border-primary pl-4 py-2">
                  <p className="font-semibold">{cls.batchName}</p>
                  {cls.subject && <p className="text-sm text-gray-700">Subject: {cls.subject}</p>}
                  <p className="text-sm text-gray-600">Teacher: {cls.teacherName}</p>
                  <p className="text-sm text-gray-600">Time: {cls.time}</p>
                  {cls.topic && <p className="text-sm text-gray-500">Topic: {cls.topic}</p>}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No classes marked as taken for today</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={24} className="text-danger" />
            <h2 className="text-2xl font-bold">Not taken / absent</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            From Class Tracking with status &quot;Not taken&quot; for today.
          </p>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notHeldClasses.length > 0 ? (
              notHeldClasses.map((row) => (
                <div key={row._id} className="bg-red-50 border-l-4 border-danger pl-4 py-2 rounded">
                  <p className="font-semibold text-red-700">{row.teacherName}</p>
                  <p className="text-sm text-gray-600">Batch: {row.batchName}</p>
                  {row.topic && <p className="text-sm text-gray-600">Topic: {row.topic}</p>}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No classes marked as not taken for today</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={24} className="text-primary" />
          <h2 className="text-2xl font-bold">Recent Activities</h2>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-semibold text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
