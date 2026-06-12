const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, couponCode, notes } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

    // Check stock and prescription
    let hasPrescriptionItem = false;
    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isAvailable) return res.status(400).json({ success: false, message: `${item.name} is no longer available` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}` });
      if (product.prescriptionRequired) hasPrescriptionItem = true;
    }

    const itemsPrice = cart.items.reduce((sum, item) => {
      const price = item.discountPrice > 0 ? item.discountPrice : item.price;
      return sum + price * item.quantity;
    }, 0);

    const shippingPrice = itemsPrice >= 499 ? 0 : 49;
    const taxPrice = Math.round(itemsPrice * 0.05 * 100) / 100;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const orderItems = cart.items.map((i) => ({
      product: i.product._id,
      name: i.name,
      image: i.image,
      price: i.discountPrice > 0 ? i.discountPrice : i.price,
      quantity: i.quantity,
      packSize: i.packSize,
      prescriptionRequired: i.prescriptionRequired,
    }));

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      prescriptionStatus: hasPrescriptionItem ? 'pending' : 'not_required',
      couponCode,
      notes,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
    });

    // Deduct stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    // Add loyalty points (1 point per ₹10)
    await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: Math.floor(totalPrice / 10) } });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (['shipped', 'delivered'].includes(order.orderStatus)) return res.status(400).json({ success: false, message: 'Cannot cancel once shipped or delivered' });

    order.orderStatus = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by user' });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    await order.save();
    res.json({ success: true, message: 'Order cancelled', order });
  } catch (error) {
    next(error);
  }
};

// ───────── ADMIN ─────────

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (search) query.orderNumber = { $regex: search, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/admin/:id/status
// @access  Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.orderStatus = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }
    order.statusHistory.push({ status, note: note || `Status changed to ${status}` });
    await order.save();
    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Dashboard stats (Admin)
// @route   GET /api/orders/admin/stats
// @access  Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $match: { orderStatus: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    const ordersByStatus = await Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]);
    const recentOrders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5);
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const lowStock = await Product.find({ stock: { $lte: 10 }, isAvailable: true }).select('name stock category').limit(10);

    // Revenue last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const revenueByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers,
        totalProducts,
        ordersByStatus,
        recentOrders,
        lowStock,
        revenueByDay,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, getDashboardStats };
