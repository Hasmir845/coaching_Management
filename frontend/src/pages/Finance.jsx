import React, { useState, useEffect, useCallback } from 'react';
import { financeAPI, batchAPI } from '../services/api';
import { Plus, Edit2, Trash2, Wallet, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { refToId } from '../utils/refs';

function formatMoney(n) {
  const v = Number(n) || 0;
  return `৳ ${v.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatEntryDate(value) {
  try {
    if (value == null) return '—';
    const d = typeof value === 'string' ? parseISO(value) : new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return format(d, 'dd MMM yyyy');
  } catch {
    return '—';
  }
}

const emptyForm = () => ({
  kind: 'income',
  amount: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  batch: '',
  purpose: '',
  notes: '',
});

const Finance = () => {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterKind, setFilterKind] = useState('all');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const rangeParams = () => {
    const p = {};
    if (rangeFrom) p.from = rangeFrom;
    if (rangeTo) p.to = rangeTo;
    return p;
  };

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { ...rangeParams() };
      if (filterKind === 'income' || filterKind === 'expense') {
        params.kind = filterKind;
      }
      const [listRes, sumRes, batchRes] = await Promise.all([
        financeAPI.getAll(params),
        financeAPI.getSummary(rangeParams()),
        batchAPI.getAll(),
      ]);
      setEntries(Array.isArray(listRes.data) ? listRes.data : []);
      const s = sumRes.data || {};
      setSummary({
        income: Number(s.income) || 0,
        expense: Number(s.expense) || 0,
        balance: Number(s.balance) || 0,
      });
      setBatches(Array.isArray(batchRes.data) ? batchRes.data : []);
    } catch (e) {
      console.error(e);
      setError('ডেটা লোড করা যায়নি। ব্যাকএন্ড চালু আছে কিনা দেখুন।');
    } finally {
      setLoading(false);
    }
  }, [filterKind, rangeFrom, rangeTo]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const resetForm = () => {
    setFormData(emptyForm());
    setEditingId(null);
    setShowForm(false);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData(emptyForm());
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    let dateStr = format(new Date(), 'yyyy-MM-dd');
    try {
      if (row.date) {
        const d = typeof row.date === 'string' ? parseISO(row.date) : new Date(row.date);
        if (!Number.isNaN(d.getTime())) dateStr = format(d, 'yyyy-MM-dd');
      }
    } catch {
      /* keep default */
    }
    setFormData({
      kind: row.kind,
      amount: String(row.amount),
      date: dateStr,
      batch: refToId(row.batch) || '',
      purpose: row.purpose || '',
      notes: row.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const amt = Number(formData.amount);
      if (!Number.isFinite(amt) || amt <= 0) {
        setError('সঠিক টাকার পরিমাণ দিন');
        setSaving(false);
        return;
      }
      const payload = {
        kind: formData.kind,
        amount: amt,
        date: formData.date,
        purpose: formData.purpose.trim(),
        notes: formData.notes.trim() || undefined,
      };
      if (formData.kind === 'income' && formData.batch) {
        payload.batch = formData.batch;
      } else {
        payload.batch = null;
      }

      if (editingId) {
        await financeAPI.update(editingId, payload);
      } else {
        await financeAPI.create(payload);
      }
      resetForm();
      await fetchAll();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'সেভ করা যায়নি';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('এই এন্ট্রি মুছে ফেলবেন?')) return;
    try {
      await financeAPI.delete(id);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'মুছতে পারিনি');
    }
  };

  const clearRange = () => {
    setRangeFrom('');
    setRangeTo('');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="text-primary" size={32} />
            Accounts
          </h1>
          <p className="text-gray-600 mt-1">
            ব্যাচ থেকে আয়, খরচের উদ্দেশ্য — সব এক জায়গায় হিসাব রাখুন।
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition"
        >
          <Plus size={20} />
          নতুন এন্ট্রি
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm border border-red-200">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm mb-1">
            <TrendingUp size={18} />
            মোট আয়
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatMoney(summary.income)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <div className="flex items-center gap-2 text-rose-700 font-medium text-sm mb-1">
            <TrendingDown size={18} />
            মোট খরচ
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatMoney(summary.expense)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <div className="flex items-center gap-2 text-secondary font-medium text-sm mb-1">
            <PiggyBank size={18} />
            ব্যালেন্স
          </div>
          <p
            className={`text-2xl font-bold ${
              summary.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatMoney(summary.balance)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 p-4 md:p-5 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">ফিল্টার (নির্বাচিত সময়ের হিসাব উপরের কার্ডে)</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">শুরুর তারিখ</label>
            <input
              type="date"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">শেষ তারিখ</label>
            <input
              type="date"
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={clearRange}
            className="text-sm text-gray-600 underline px-2 py-2"
          >
            সব তারিখ
          </button>
          <div className="ml-auto flex gap-2">
            {['all', 'income', 'expense'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilterKind(k)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filterKind === k
                    ? 'bg-secondary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {k === 'all' ? 'সব' : k === 'income' ? 'আয়' : 'খরচ'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-5 md:p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'এডিট' : 'নতুন'} এন্ট্রি</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-gray-700">ধরন নির্বাচন করুন</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, kind: 'income' }))}
                  className={`rounded-xl border-2 px-4 py-4 text-left transition shadow-sm ${
                    formData.kind === 'income'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200'
                      : 'border-gray-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <span className="block text-sm font-bold text-emerald-800">আয়</span>
                  <span className="text-xs text-gray-600">ব্যাচ / ফি / টিউশন ফি ইত্যাদি</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, kind: 'expense', batch: '' }))}
                  className={`rounded-xl border-2 px-4 py-4 text-left transition shadow-sm ${
                    formData.kind === 'expense'
                      ? 'border-rose-600 bg-rose-50 ring-2 ring-rose-200'
                      : 'border-gray-200 bg-white hover:border-rose-300'
                  }`}
                >
                  <span className="block text-sm font-bold text-rose-800">খরচ</span>
                  <span className="text-xs text-gray-600">ভাড়া, বেতন, বই, ইউটিলিটি — যেকোনো খরচ</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-sm text-gray-600 mb-1">টাকার পরিমাণ *</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">তারিখ *</label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {formData.kind === 'income' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">ব্যাচ (ঐচ্ছিক)</label>
                <select
                  value={formData.batch}
                  onChange={(e) => setFormData((p) => ({ ...p, batch: e.target.value }))}
                  className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">— ব্যাচ নির্বাচন করুন —</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.subject})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {formData.kind === 'income' ? 'বিবরণ (কিসের টাকা)' : 'খরচের উদ্দেশ্য'} *
              </label>
              <input
                required
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData((p) => ({ ...p, purpose: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder={
                  formData.kind === 'income' ? 'যেমন: জানুয়ারি মাসের ফি' : 'যেমন: ভাড়া, বেতন, স্টেশনারি'
                }
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">নোট (ঐচ্ছিক)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="অতিরিক্ত মন্তব্য"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                {saving ? 'সেভ হচ্ছে...' : 'সেভ'}
              </button>
              <button type="button" onClick={resetForm} className="px-5 py-2 rounded-lg border border-gray-300">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-900">লেজার</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-500">লোড হচ্ছে...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">কোনো এন্ট্রি নেই। উপরে &quot;নতুন এন্ট্রি&quot; চাপুন।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold">তারিখ</th>
                  <th className="px-4 py-3 font-semibold">ধরন</th>
                  <th className="px-4 py-3 font-semibold">পরিমাণ</th>
                  <th className="px-4 py-3 font-semibold">বিবরণ / উদ্দেশ্য</th>
                  <th className="px-4 py-3 font-semibold">ব্যাচ</th>
                  <th className="px-4 py-3 font-semibold w-24">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row) => (
                  <tr key={row._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatEntryDate(row.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          row.kind === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {row.kind === 'income' ? 'আয়' : 'খরচ'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${row.kind === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {row.kind === 'expense' ? '− ' : '+ '}
                      {formatMoney(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div>{row.purpose}</div>
                      {row.notes && <div className="text-xs text-gray-500 mt-0.5">{row.notes}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.batch ? `${row.batch.name}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          aria-label="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;
