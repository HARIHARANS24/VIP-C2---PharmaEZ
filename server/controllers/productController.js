const Product = require('../models/Product');

// @desc    Get all products with filters/search/pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, subcategory, minPrice, maxPrice, prescriptionRequired, sort, page = 1, limit = 12 } = req.query;
    const query = {};
    if (keyword) query.$or = [{ name: { $regex: keyword, $options: 'i' } }, { genericName: { $regex: keyword, $options: 'i' } }, { tags: { $in: [new RegExp(keyword, 'i')] } }];
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (prescriptionRequired !== undefined) query.prescriptionRequired = prescriptionRequired === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    query.isAvailable = true;

    const sortObj = {};
    if (sort === 'price_asc') sortObj.price = 1;
    else if (sort === 'price_desc') sortObj.price = -1;
    else if (sort === 'rating') sortObj.rating = -1;
    else if (sort === 'newest') sortObj.createdAt = -1;
    else sortObj.isFeatured = -1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortObj).skip(skip).limit(Number(limit));

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isAvailable: true }).limit(8);
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res, next) => {
  try {
    const imageUrls = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : (req.body.images || []);
    const product = await Product.create({ ...req.body, images: imageUrls });
    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    const review = { user: req.user._id, name: req.user.name, rating: Number(rating), comment };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ success: true, message: 'Review added', rating: product.rating, numReviews: product.numReviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by category (for homepage)
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = async (req, res, next) => {
  try {
    const products = await Product.find({ category: req.params.category, isAvailable: true }).limit(8);
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, getFeaturedProducts, createProduct, updateProduct, deleteProduct, addReview, getProductsByCategory };
