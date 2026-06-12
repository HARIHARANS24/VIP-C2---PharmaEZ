const User = require('../models/User');
const AdminConfig = require('../models/AdminConfig');
const Product = require('../models/Product');

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (Admin)
// @route   PUT /api/admin/users/:id/toggle
// @access  Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all prescriptions pending review (Admin)
// @route   GET /api/admin/prescriptions
// @access  Admin
const getPrescriptions = async (req, res, next) => {
  try {
    const users = await User.find({ 'prescriptions.0': { $exists: true } }).select('name email prescriptions');
    const allPrescriptions = [];
    users.forEach((u) => {
      u.prescriptions.forEach((p) => {
        allPrescriptions.push({ ...p.toObject(), userId: u._id, userName: u.name, userEmail: u.email });
      });
    });
    allPrescriptions.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    res.json({ success: true, prescriptions: allPrescriptions });
  } catch (error) {
    next(error);
  }
};

// @desc    Update prescription status (Admin)
// @route   PUT /api/admin/prescriptions/:userId/:prescriptionId
// @access  Admin
const updatePrescriptionStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const prescription = user.prescriptions.id(req.params.prescriptionId);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    prescription.status = status;
    if (notes) prescription.notes = notes;
    await user.save();
    res.json({ success: true, message: `Prescription ${status}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get/initialize admin config
// @route   GET /api/admin/config
// @access  Public (banners/categories) / Admin (full)
const getAdminConfig = async (req, res, next) => {
  try {
    let config = await AdminConfig.findOne();
    if (!config) {
      config = await AdminConfig.create({
        banners: [
          { title: 'Medicines Delivered Fast', subtitle: 'Get genuine medicines at your doorstep', isActive: true, order: 1 },
          { title: 'Flat 20% Off on Vitamins', subtitle: 'Shop now and stay healthy', isActive: true, order: 2 },
        ],
        categories: [],
      });
    }
    res.json({ success: true, config });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin config
// @route   PUT /api/admin/config
// @access  Admin
const updateAdminConfig = async (req, res, next) => {
  try {
    let config = await AdminConfig.findOne();
    if (!config) config = new AdminConfig({});
    Object.assign(config, req.body);
    await config.save();
    res.json({ success: true, message: 'Config updated', config });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory report
// @route   GET /api/admin/inventory
// @access  Admin
const getInventoryReport = async (req, res, next) => {
  try {
    const total = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.find({ stock: { $gt: 0, $lte: 10 } }).select('name stock category price');
    const inStock = await Product.countDocuments({ stock: { $gt: 10 } });
    const byCategory = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stock' } } }]);
    res.json({ success: true, inventory: { total, outOfStock, inStock, lowStockCount: lowStock.length, lowStockItems: lowStock, byCategory } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, toggleUserStatus, getPrescriptions, updatePrescriptionStatus, getAdminConfig, updateAdminConfig, getInventoryReport };
