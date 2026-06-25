const userService = require('../services/userService');

async function getMe(req, res, next) {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
}

async function updateName(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }
    const updated = await userService.updateUserName(req.user._id, name);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function updateAddress(req, res, next) {
  try {
    const { postalCode, country } = req.body;
    if (!postalCode || !country) {
      return res.status(400).json({ message: 'Postal code and country are required' });
    }
    const updated = await userService.updateUserAddress(req.user._id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function uploadProfilePic(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

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

async function deleteAccount(req, res, next) {
  try {
    await userService.deleteUser(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateName, updateAddress, uploadProfilePic, getProfilePic, deleteAccount };
