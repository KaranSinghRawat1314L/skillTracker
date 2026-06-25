const mongoose = require('mongoose');
const { Readable } = require('stream');
const User = require('../models/User');
const { getGfsBucket } = require('../config/db');

async function getUserById(userId) {
  return User.findById(userId);
}

async function updateUserName(userId, name) {
  return User.findByIdAndUpdate(
    userId,
    { name: name.trim() },
    { new: true, runValidators: true }
  );
}

async function updateUserAddress(userId, { line1, line2, city, state, postalCode, country, mobile }) {
  return User.findByIdAndUpdate(
    userId,
    {
      address: { line1, line2, city, state, postalCode, country },
      ...(mobile !== undefined && { mobile }),
    },
    { new: true, runValidators: true }
  );
}

/**
 * Stores a profile picture in GridFS.
 * Deletes the old file first if one exists.
 * Returns the new GridFS file _id.
 */
async function uploadProfilePic(userId, fileBuffer, mimetype, originalname) {
  const bucket = getGfsBucket();
  const user = await User.findById(userId);

  // Delete existing profile pic from GridFS if present
  if (user.profilePicId) {
    try {
      await bucket.delete(new mongoose.Types.ObjectId(user.profilePicId));
    } catch {
      // File may have been deleted already — safe to ignore
    }
  }

  // Upload new file to GridFS
  const filename = `profile_${userId}_${Date.now()}_${originalname}`;
  const fileId = await new Promise((resolve, reject) => {
    const readableStream = Readable.from(fileBuffer);
    const uploadStream = bucket.openUploadStream(filename, { contentType: mimetype });

    readableStream.pipe(uploadStream);
    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.on('error', reject);
  });

  // Save the new file id on the user document
  await User.findByIdAndUpdate(userId, { profilePicId: fileId });

  return fileId;
}

/**
 * Streams a profile picture from GridFS to the HTTP response.
 */
async function streamProfilePic(fileId, res) {
  const bucket = getGfsBucket();

  // Check file exists
  const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
  if (!files.length) {
    const err = new Error('Profile picture not found');
    err.statusCode = 404;
    throw err;
  }

  res.set('Content-Type', files[0].contentType || 'image/jpeg');
  bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId)).pipe(res);
}

async function deleteUser(userId) {
  const bucket = getGfsBucket();
  const user = await User.findById(userId);

  if (user?.profilePicId) {
    try {
      await bucket.delete(new mongoose.Types.ObjectId(user.profilePicId));
    } catch { /* safe to ignore */ }
  }

  await User.findByIdAndDelete(userId);
}

module.exports = {
  getUserById,
  updateUserName,
  updateUserAddress,
  uploadProfilePic,
  streamProfilePic,
  deleteUser,
};
