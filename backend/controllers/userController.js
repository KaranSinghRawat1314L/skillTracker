const userService = require('../services/userService');

async function uploadProfilePic(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // req.file.buffer is available because multer is configured with memoryStorage()
    const fileId = await userService.uploadProfilePic(
      req.user._id,
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    res.json({ profilePicId: fileId });
  } catch (err) {
    next(err);
  }
}

async function getProfilePic(req, res, next) {
  try {
    await userService.streamProfilePic(req.params.fileId, res);
  } catch (err) {
    next(err);
  }
}

async function deleteProfilePic(req, res, next) {
  try {
    await userService.deleteProfilePic(req.user._id);
    res.json({ message: 'Profile picture removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadProfilePic, getProfilePic, deleteProfilePic };
