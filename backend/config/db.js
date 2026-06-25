const mongoose = require('mongoose');

let gfsBucket = null;

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // GridFSBucket needs the raw MongoDB driver's db object,
    // which is available at conn.connection.db AFTER connection succeeds.
    // bucketName 'profilePics' creates two collections under the hood:
    //   - profilePics.files  (metadata: filename, size, contentType, etc.)
    //   - profilePics.chunks (actual binary data, split into 256KB pieces)
    gfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: 'profilePics',
    });

    console.log('✅ MongoDB connected');
    console.log('✅ GridFS bucket ready (profilePics)');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

// Other files (services, controllers) call this to get the bucket instance
function getGfsBucket() {
  if (!gfsBucket) {
    throw new Error('GridFS not initialized yet. Make sure connectDB() ran first.');
  }
  return gfsBucket;
}

module.exports = { connectDB, getGfsBucket };
