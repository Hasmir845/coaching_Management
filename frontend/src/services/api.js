import axios from 'axios';

/** Netlify/Vercel: accept `https://api.example.com` or `.../api` (axios paths are /teachers, /finance, …) */
function normalizeApiBase(raw) {
  if (raw == null || String(raw).trim() === '') return null;
  let u = String(raw).trim().replace(/\/+$/, '');
  if (!u.endsWith('/api')) u = `${u}/api`;
  return u;
}

function resolveApiBase() {
  if (import.meta.env.DEV) return '/api';
  const fromEnv = normalizeApiBase(import.meta.env.VITE_API_URL);
  if (fromEnv) return fromEnv;
  return 'https://coaching-management-beta.vercel.app/api';
}

export const apiBaseURL = resolveApiBase();

if (!import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  console.warn(
    'VITE_API_URL not set on Netlify. Using fallback:',
    apiBaseURL,
    '\nSet VITE_API_URL and redeploy for a stable production build.'
  );
}

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 12000,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 403 || error.message === 'Network Error') {
      console.error(
        '[API]',
        error.message,
        '— CORS বা Vercel FRONTEND_URL চেক করুন। API:',
        apiBaseURL
      );
    }
    return Promise.reject(error);
  }
);

// Teachers API
export const teacherAPI = {
  getAll: () => api.get('/teachers'),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
  search: (query) => api.get(`/teachers/search?q=${query}`),
};

// Students API
export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  search: (query) => api.get(`/students/search?q=${query}`),
  getByBatch: (batchId) => api.get(`/students/batch/${batchId}`),
};

// Batches API
export const batchAPI = {
  getAll: () => api.get('/batches'),
  getById: (id) => api.get(`/batches/${id}`),
  create: (data) => api.post('/batches', data),
  update: (id, data) => api.put(`/batches/${id}`, data),
  delete: (id) => api.delete(`/batches/${id}`),
  search: (query) => api.get(`/batches/search?q=${query}`),
  assignTeacher: (batchId, teacherId) => api.post(`/batches/${batchId}/teachers`, { teacherId }),
  removeTeacher: (batchId, teacherId) => api.delete(`/batches/${batchId}/teachers/${teacherId}`),
  addStudent: (batchId, studentId) => api.post(`/batches/${batchId}/students`, { studentId }),
  removeStudent: (batchId, studentId) => api.delete(`/batches/${batchId}/students/${studentId}`),
};

// Class Tracking API
export const classTrackingAPI = {
  getAll: () => api.get('/class-tracking'),
  getById: (id) => api.get(`/class-tracking/${id}`),
  create: (data) => api.post('/class-tracking', data),
  update: (id, data) => api.put(`/class-tracking/${id}`, data),
  delete: (id) => api.delete(`/class-tracking/${id}`),
  getByDate: (date) => api.get(`/class-tracking/date/${date}`),
  getByBatch: (batchId) => api.get(`/class-tracking/batch/${batchId}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getTodayClasses: () => api.get('/dashboard/today-classes'),
  getWeeklySchedule: (weekStart) =>
    api.get('/dashboard/weekly-schedule', { params: weekStart ? { weekStart } : {} }),
  getAbsentTeachers: () => api.get('/dashboard/absent-teachers'),
  getRecentActivities: () => api.get('/dashboard/recent-activities'),
};

// Slot attendance (timetable checklist per day / week summary)
export const slotAttendanceAPI = {
  getChecklist: (date) => api.get('/slot-attendance/checklist', { params: { date } }),
  getWeekSummary: (weekStart) =>
    api.get('/slot-attendance/week-summary', { params: weekStart ? { weekStart } : {} }),
  getTakenRegister: (params) => api.get('/slot-attendance/taken-register', { params: params || {} }),
  upsert: (data) => api.post('/slot-attendance', data),
};

// Reports API
export const reportsAPI = {
  getTeacherClassCount: () => api.get('/reports/teacher-class-count'),
  getAbsentCount: () => api.get('/reports/absent-count'),
  getBatchClassHistory: (batchId) => api.get(`/reports/batch-history/${batchId}`),
};

// Finance / accounts (income from batches, expenses by purpose)
export const financeAPI = {
  getAll: (params) => api.get('/finance', { params: params || {} }),
  getSummary: (params) => api.get('/finance/summary', { params: params || {} }),
  create: (data) => api.post('/finance', data),
  update: (id, data) => api.put(`/finance/${id}`, data),
  delete: (id) => api.delete(`/finance/${id}`),
};

export default api;
