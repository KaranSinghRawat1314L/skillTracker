const express = require('express');
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth');
const {
  uploadProfilePic,
  getProfilePic,
  deleteProfilePic,
} = require('../controllers/userController');

const router = express.Router();

// IMPORTANT: memoryStorage (NOT diskStorage) — we need req.file.buffer
// to stream directly into GridFS. Nothing gets written to local disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'));
  },
});

// Public route — no auth needed to VIEW an avatar (so <img src="..."> works
// directly in the browser without sending an Authorization header)
router.get('/profile-pic/:fileId', getProfilePic);

router.use(authMiddleware);

// Authenticated routes — only the logged-in user can upload/delete their own pic
router.post('/profile-pic', upload.single('profilePic'), uploadProfilePic);
router.delete('/profile-pic', deleteProfilePic);

module.exports = router;
