import React, { useState, useEffect } from 'react';
import { reportsAPI, batchAPI } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const Reports = () => {
  const [teacherClassCount, setTeacherClassCount] = useState([]);
  const [absentCount, setAbsentCount] = useState([]);
  const [batchHistory, setBatchHistory] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [teacherRes, absentRes, batchRes] = await Promise.all([
        reportsAPI.getTeacherClassCount(),
        reportsAPI.getAbsentCount(),
        batchAPI.getAll(),
      ]);

      setTeacherClassCount(teacherRes.data || []);
      setAbsentCount(absentRes.data || []);
      setBatches(batchRes.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSelect = async (batchId) => {
    setSelectedBatch(batchId);
    if (batchId) {
      try {
        const res = await reportsAPI.getBatchClassHistory(batchId);
        setBatchHistory(res.data || []);
      } catch (error) {
        console.error('Error fetching batch history:', error);
      }
    } else {
      setBatchHistory([]);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-secondary">Reports</h1>
        <p className="text-gray-600 mt-1">View coaching center analytics</p>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 mb-8">
        <article className="card flex flex-col">
          <h2 className="text-xl font-bold text-secondary mb-1">Classes per teacher</h2>
          <p className="text-sm text-gray-500 mb-4">Total class records attributed to each teacher</p>
          <div className="w-full min-h-[320px] flex-1">
            {teacherClassCount.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  layout="vertical"
                  data={teacherClassCount}
                  margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal />
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="teacherName"
                    width={112}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="classCount" name="Classes" fill="#3B82F6" radius={[0, 6, 6, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm py-8 text-center">No data available</p>
            )}
          </div>
        </article>

        <article className="card flex flex-col">
          <h2 className="text-xl font-bold text-secondary mb-1">Absence total (students)</h2>
          <p className="text-sm text-gray-500 mb-4">Sum of absent student counts by teacher</p>
          <div className="w-full min-h-[320px] flex-1 flex items-center justify-center">
            {absentCount.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart margin={{ top: 12, right: 12, left: 12, bottom: 48 }}>
                  <Pie
                    data={absentCount}
                    dataKey="count"
                    nameKey="teacher"
                    cx="50%"
                    cy="46%"
                    innerRadius={52}
                    outerRadius={88}
                    paddingAngle={2}
                    label={false}
                  >
                    {absentCount.map((entry, index) => (
                      <Cell key={`cell-${entry.teacher}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Absent count']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm py-8 text-center">No data available</p>
            )}
          </div>
        </article>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl font-bold text-secondary">Batch class history</h2>
          <p className="text-sm text-gray-500 mt-1">Pick a batch to see dated sessions and attendance</p>
        </div>

        <div className="max-w-xl mb-6">
          <label htmlFor="report-batch" className="block text-sm font-semibold text-gray-700 mb-2">
            Select batch
          </label>
          <select
            id="report-batch"
            value={selectedBatch}
            onChange={(e) => handleBatchSelect(e.target.value)}
            className="input-field"
          >
            <option value="">— Select a batch —</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.name} · {batch.subject}
              </option>
            ))}
          </select>
        </div>

        {!selectedBatch ? (
          <p className="text-gray-500 text-sm">Select a batch to view history.</p>
        ) : batchHistory.length === 0 ? (
          <p className="text-gray-500 text-sm">No class records for this batch yet.</p>
        ) : (
          <div className="table-container -mx-px">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary text-white">
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Topic</th>
                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap w-24">Present</th>
                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap w-24">Absent</th>
                  <th className="px-4 py-3 text-right font-semibold whitespace-nowrap w-28">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {batchHistory.map((record, idx) => {
                  const total = (record.presentCount || 0) + (record.absentCount || 0);
                  const percentage = total > 0 ? ((record.presentCount / total) * 100).toFixed(1) : '0.0';
                  return (
                    <tr
                      key={idx}
                      className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/90'} hover:bg-blue-50/50`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-medium">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-800 max-w-md">{record.topic || '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className="badge-success">{record.presentCount}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className="badge-danger">{record.absentCount}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-gray-900">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Reports;
