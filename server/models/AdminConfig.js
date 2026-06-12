const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  icon: { type: String, default: '' },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  subcategories: [{ type: String }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  image: { type: String, default: '' },
  link: { type: String, default: '/' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

const adminConfigSchema = new mongoose.Schema(
  {
    banners: [bannerSchema],
    categories: [categorySchema],
    settings: {
      storeName: { type: String, default: 'PharmaEZ' },
      storeEmail: { type: String, default: 'support@pharmaez.com' },
      storePhone: { type: String, default: '+91-1800-000-0000' },
      freeShippingThreshold: { type: Number, default: 499 },
      shippingCharge: { type: Number, default: 49 },
      taxRate: { type: Number, default: 5 },
      maintenanceMode: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminConfig', adminConfigSchema);
