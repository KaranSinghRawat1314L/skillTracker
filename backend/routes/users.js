const express = require('express');
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth');
const {
  getMe,
  updateName,
  updateAddress,
  uploadProfilePic,
  getProfilePic,
  deleteAccount,
} = require('../controllers/userController');

const router = express.Router();

// In-memory storage: the buffer is passed to GridFS in the service layer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'));
  },
});

// Profile pic served from GridFS — public (no auth needed to display an avatar in a page)
router.get('/profile-pic/:fileId', getProfilePic);

router.use(authMiddleware);

router.get('/me',          getMe);
router.put('/me',          updateName);      // update display name
router.put('/address',     updateAddress);   // update address + mobile
router.post('/profile-pic', upload.single('profilePic'), uploadProfilePic);
router.delete('/me',       deleteAccount);

module.exports = router;
