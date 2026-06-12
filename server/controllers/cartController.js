const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price discountPrice stock isAvailable prescriptionRequired');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (!product.isAvailable || product.stock < 1) return res.status(400).json({ success: false, message: 'Product is out of stock' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingIdx = cart.items.findIndex((i) => i.product.toString() === productId);
    if (existingIdx > -1) {
      const newQty = cart.items[existingIdx].quantity + Number(quantity);
      if (newQty > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });
      cart.items[existingIdx].quantity = newQty;
    } else {
      if (Number(quantity) > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });
      cart.items.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        discountPrice: product.discountPrice,
        prescriptionRequired: product.prescriptionRequired,
        quantity: Number(quantity),
        packSize: product.packSize,
      });
    }
    await cart.save();
    await cart.populate('items.product', 'name images price discountPrice stock isAvailable');
    res.json({ success: true, message: 'Added to cart', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const product = await Product.findById(item.product);
    if (Number(quantity) > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} in stock` });

    if (Number(quantity) < 1) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = Number(quantity);
    }
    await cart.save();
    await cart.populate('items.product', 'name images price discountPrice stock isAvailable');
    res.json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items.pull(req.params.itemId);
    await cart.save();
    res.json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
