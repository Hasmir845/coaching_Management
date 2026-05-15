const ClassTracking = require('../models/ClassTracking');

const batchLookupStages = [
  {
    $lookup: {
      from: 'batches',
      localField: 'batch',
      foreignField: '_id',
      as: 'batchData',
    },
  },
  {
    $addFields: {
      teacherRef: {
        $ifNull: [
          '$teacher',
          {
            $ifNull: [
              { $arrayElemAt: ['$batchData.teacher', 0] },
              { $arrayElemAt: [{ $ifNull: ['$batchData.teachers', []] }, 0] },
            ],
          },
        ],
      },
    },
  },
  {
    $lookup: {
      from: 'teachers',
      localField: 'teacherRef',
      foreignField: '_id',
      as: 'teacherLookup',
    },
  },
  {
    $addFields: {
      teacherLookup: { $arrayElemAt: ['$teacherLookup', 0] },
    },
  },
];

// Get teacher class count report
exports.getTeacherClassCount = async (req, res) => {
  try {
    const report = await ClassTracking.aggregate([
      ...batchLookupStages,
      {
        $group: {
          _id: '$teacherLookup._id',
          teacherName: { $first: { $ifNull: ['$teacherLookup.name', 'Unknown'] } },
          classCount: { $sum: 1 },
        },
      },
      { $sort: { classCount: -1 } },
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get absent count report
exports.getAbsentCount = async (req, res) => {
  try {
    const report = await ClassTracking.aggregate([
      ...batchLookupStages,
      {
        $group: {
          _id: '$teacherLookup._id',
          teacher: { $first: { $ifNull: ['$teacherLookup.name', 'Unknown'] } },
          count: { $sum: { $ifNull: ['$totalAbsent', 0] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get batch class history
exports.getBatchClassHistory = async (req, res) => {
  try {
    const history = await ClassTracking.find({ batch: req.params.batchId })
      .sort({ date: -1 })
      .populate('batch');

    const report = history.map((record) => ({
      date: record.date,
      topic: record.topic,
      presentCount: record.totalPresent,
      absentCount: record.totalAbsent,
    }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
