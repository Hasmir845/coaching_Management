const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    console.log('MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    process.exit(1);
  }
};

module.exports = dbConnect;
