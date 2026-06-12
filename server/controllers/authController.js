const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('wishlist', 'name images price discountPrice category');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, dateOfBirth, gender } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.gender = gender || user.gender;
    await user.save();
    res.json({ success: true, message: 'Profile updated', user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, gender: user.gender, dateOfBirth: user.dateOfBirth } });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add address
// @route   POST /api/auth/address
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { fullName, phone, street, city, state, pincode, isDefault } = req.body;
    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push({ fullName, phone, street, city, state, pincode, isDefault: isDefault || user.addresses.length === 0 });
    await user.save();
    res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/auth/address/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, message: 'Address removed', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle wishlist
// @route   POST /api/auth/wishlist/:productId
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.productId;
    const idx = user.wishlist.findIndex((id) => id.toString() === pid);
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(pid);
    }
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload prescription
// @route   POST /api/auth/prescription
// @access  Private
const uploadPrescription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { doctorName, notes } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';
    user.prescriptions.push({ fileName: req.file?.originalname || '', fileUrl, doctorName, notes });
    await user.save();
    res.status(201).json({ success: true, message: 'Prescription uploaded successfully', prescriptions: user.prescriptions });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword, addAddress, deleteAddress, toggleWishlist, uploadPrescription };
