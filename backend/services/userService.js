const mongoose = require('mongoose');
const { Readable } = require('stream');
const User = require('../models/User');
const { getGfsBucket } = require('../config/db');

/**
 * Uploads a profile picture to GridFS.
 * - fileBuffer comes from multer's memory storage (req.file.buffer)
 * - Deletes the user's OLD profile pic from GridFS first (avoids orphaned files)
 * - Saves the new file's GridFS _id onto the User document
 */
async function uploadProfilePic(userId, fileBuffer, mimetype, originalname) {
  const bucket = getGfsBucket();
  const user = await User.findById(userId);

  // 1. Delete old file if one exists — otherwise old images pile up forever
  if (user.profilePicId) {
    try {
      await bucket.delete(new mongoose.Types.ObjectId(user.profilePicId));
    } catch {
      // File might already be gone — safe to ignore
    }
  }

  // 2. Convert the buffer to a readable stream and pipe it into GridFS
  const filename = `profile_${userId}_${Date.now()}_${originalname}`;

  const fileId = await new Promise((resolve, reject) => {
    const readableStream = Readable.from(fileBuffer);
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimetype,
    });

    readableStream.pipe(uploadStream);

    // openUploadStream gives us the new file's _id immediately,
    // but we only resolve once the write actually finishes.
    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.on('error', reject);
  });

  // 3. Save the reference on the User document
  await User.findByIdAndUpdate(userId, { profilePicId: fileId });

  return fileId;
}

/**
 * Streams a file from GridFS directly to the HTTP response.
 * This is how the browser actually "sees" the image —
 * no intermediate temp file, no base64 conversion.
 */
async function streamProfilePic(fileId, res) {
  const bucket = getGfsBucket();
  const objectId = new mongoose.Types.ObjectId(fileId);

  // Check the file exists before trying to stream it
  const files = await bucket.find({ _id: objectId }).toArray();
  if (!files.length) {
    const err = new Error('Profile picture not found');
    err.statusCode = 404;
    throw err;
  }

  res.set('Content-Type', files[0].contentType || 'image/jpeg');
  bucket.openDownloadStream(objectId).pipe(res);
}

async function deleteProfilePic(userId) {
  const bucket = getGfsBucket();
  const user = await User.findById(userId);

  if (user?.profilePicId) {
    await bucket.delete(new mongoose.Types.ObjectId(user.profilePicId));
    await User.findByIdAndUpdate(userId, { profilePicId: null });
  }
}

module.exports = { uploadProfilePic, streamProfilePic, deleteProfilePic };
