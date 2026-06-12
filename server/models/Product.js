const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    genericName: { type: String, trim: true, default: '' },
    description: { type: String, required: [true, 'Description is required'] },
    manufacturer: { type: String, required: [true, 'Manufacturer is required'] },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Prescription Medicines',
        'OTC Medicines',
        'Vitamins & Supplements',
        'Personal Care',
        'Medical Devices',
        'Baby Care',
        'Wellness Products',
        'Healthcare Equipment',
        'Ayurvedic & Herbal',
        'COVID Essentials',
      ],
    },
    subcategory: { type: String, default: '' },
    images: [{ type: String }],
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    discountPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    stock: { type: Number, required: [true, 'Stock is required'], min: 0, default: 0 },
    unit: { type: String, default: 'piece' },        // strip/tablet/bottle/ml/mg etc.
    packSize: { type: String, default: '' },
    prescriptionRequired: { type: Boolean, default: false },
    saltComposition: { type: String, default: '' },
    dosageForm: { type: String, default: '' },        // tablet/syrup/capsule/injection
    strength: { type: String, default: '' },
    sideEffects: [{ type: String }],
    usageInstructions: { type: String, default: '' },
    storageInstructions: { type: String, default: '' },
    expiryDate: { type: Date },
    batchNumber: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Auto-calculate discountPercent and discountPrice
productSchema.pre('save', function (next) {
  if (this.discountPrice > 0 && this.price > 0) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  if (this.discountPercent > 0 && this.price > 0 && this.discountPrice === 0) {
    this.discountPrice = this.price - (this.price * this.discountPercent) / 100;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
