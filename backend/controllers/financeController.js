const FinanceEntry = require('../models/FinanceEntry');

function buildDateFilter(from, to) {
  const filter = {};
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) filter.$gte = d;
  }
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      filter.$lte = d;
    }
  }
  return Object.keys(filter).length ? { date: filter } : {};
}

exports.getEntries = async (req, res) => {
  try {
    const { from, to, kind } = req.query;
    const query = { ...buildDateFilter(from, to) };
    if (kind === 'income' || kind === 'expense') {
      query.kind = kind;
    }
    const entries = await FinanceEntry.find(query)
      .populate('batch', 'name subject')
      .sort({ date: -1, createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = buildDateFilter(from, to);
    const rows = await FinanceEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$kind',
          total: { $sum: '$amount' },
        },
      },
    ]);
    let income = 0;
    let expense = 0;
    for (const row of rows) {
      if (row._id === 'income') income = row.total;
      if (row._id === 'expense') expense = row.total;
    }
    res.json({
      income,
      expense,
      balance: income - expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEntry = async (req, res) => {
  try {
    const { kind, amount, date, batch, purpose, notes } = req.body;
    if (kind !== 'income' && kind !== 'expense') {
      return res.status(400).json({ message: 'kind must be income or expense' });
    }
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }
    const p = (purpose || '').trim();
    if (!p) {
      return res.status(400).json({ message: 'purpose is required' });
    }
    const entry = new FinanceEntry({
      kind,
      amount: num,
      date: date ? new Date(date) : new Date(),
      batch: batch || undefined,
      purpose: p,
      notes: (notes || '').trim() || undefined,
    });
    const saved = await entry.save();
    const populated = await FinanceEntry.findById(saved._id).populate('batch', 'name subject');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const { kind, amount, date, batch, purpose, notes } = req.body;
    const entry = await FinanceEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    if (kind !== undefined) {
      if (kind !== 'income' && kind !== 'expense') {
        return res.status(400).json({ message: 'kind must be income or expense' });
      }
      entry.kind = kind;
    }
    if (amount !== undefined) {
      const num = Number(amount);
      if (!Number.isFinite(num) || num <= 0) {
        return res.status(400).json({ message: 'amount must be a positive number' });
      }
      entry.amount = num;
    }
    if (date !== undefined) {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: 'Invalid date' });
      }
      entry.date = d;
    }
    if (batch !== undefined) {
      entry.batch = batch || null;
    }
    if (purpose !== undefined) {
      const p = (purpose || '').trim();
      if (!p) return res.status(400).json({ message: 'purpose cannot be empty' });
      entry.purpose = p;
    }
    if (notes !== undefined) {
      entry.notes = (notes || '').trim() || undefined;
    }

    await entry.save();
    const populated = await FinanceEntry.findById(entry._id).populate('batch', 'name subject');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const entry = await FinanceEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
