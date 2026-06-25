const mongoose = require('mongoose');

let gfsBucket = null;

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // Initialize GridFSBucket after connection for profile pic storage
    gfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: 'profilePics',
    });

    console.log('✅ MongoDB connected');
    console.log('✅ GridFS bucket ready');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

function getGfsBucket() {
  if (!gfsBucket) throw new Error('GridFS not initialized. Call connectDB first.');
  return gfsBucket;
}

module.exports = { connectDB, getGfsBucket };
