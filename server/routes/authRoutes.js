const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
  register, login, getProfile, updateProfile, changePassword,
  addAddress, deleteAddress, toggleWishlist, uploadPrescription,
} = require('../controllers/authController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `prescription-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only images and PDFs allowed'));
}});

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/address', protect, addAddress);
router.delete('/address/:id', protect, deleteAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);
router.post('/prescription', protect, upload.single('prescription'), uploadPrescription);

module.exports = router;
