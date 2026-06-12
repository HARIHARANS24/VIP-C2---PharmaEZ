require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');

const sampleProducts = [
  { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', description: 'Effective pain reliever and fever reducer. Suitable for adults and children above 12 years. Provides fast relief from headaches, body ache, and mild to moderate fever.', manufacturer: 'Sun Pharma', category: 'OTC Medicines', subcategory: 'Pain Relief', price: 35, discountPrice: 28, stock: 500, unit: 'strip', packSize: '15 tablets', prescriptionRequired: false, saltComposition: 'Paracetamol 500mg', dosageForm: 'Tablet', strength: '500mg', usageInstructions: '1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours.', storageInstructions: 'Store below 25°C. Keep away from moisture.', isFeatured: true, tags: ['paracetamol', 'pain relief', 'fever', 'headache'], images: ['https://placehold.co/400x400/4CAF50/white?text=Paracetamol'], rating: 4.5, numReviews: 128 },
  { name: 'Azithromycin 500mg', genericName: 'Azithromycin', description: 'Broad-spectrum antibiotic used to treat bacterial infections including respiratory tract infections, skin infections, and sexually transmitted infections.', manufacturer: 'Cipla', category: 'Prescription Medicines', subcategory: 'Antibiotics', price: 185, discountPrice: 165, stock: 200, unit: 'strip', packSize: '3 tablets', prescriptionRequired: true, saltComposition: 'Azithromycin 500mg', dosageForm: 'Tablet', strength: '500mg', usageInstructions: 'Take as directed by your physician. Usually 1 tablet daily.', storageInstructions: 'Store below 30°C in a dry place.', isFeatured: false, tags: ['antibiotic', 'azithromycin', 'infection'], images: ['https://placehold.co/400x400/2196F3/white?text=Azithromycin'], rating: 4.3, numReviews: 45 },
  { name: 'Vitamin C 1000mg Effervescent', genericName: 'Ascorbic Acid', description: 'High-potency Vitamin C tablets that dissolve in water, providing immune support, antioxidant protection, and collagen synthesis. Orange flavored and pleasant to drink.', manufacturer: 'Himalaya', category: 'Vitamins & Supplements', subcategory: 'Vitamin C', price: 299, discountPrice: 239, stock: 350, unit: 'tube', packSize: '20 tablets', prescriptionRequired: false, saltComposition: 'Vitamin C 1000mg', dosageForm: 'Effervescent Tablet', strength: '1000mg', usageInstructions: 'Dissolve 1 tablet in 200ml water and drink once daily.', storageInstructions: 'Keep tube tightly closed. Store in cool, dry place.', isFeatured: true, tags: ['vitamin c', 'immunity', 'antioxidant', 'effervescent'], images: ['https://placehold.co/400x400/FF9800/white?text=Vitamin+C'], rating: 4.7, numReviews: 210 },
  { name: 'Omega-3 Fish Oil 1000mg', genericName: 'Omega-3 Fatty Acids', description: 'Premium fish oil supplement providing EPA and DHA for heart health, brain function, and joint support. Sourced from deep-sea fish, molecularly distilled for purity.', manufacturer: 'HealthVit', category: 'Vitamins & Supplements', subcategory: 'Omega 3', price: 649, discountPrice: 499, stock: 180, unit: 'bottle', packSize: '60 softgels', prescriptionRequired: false, dosageForm: 'Softgel', usageInstructions: 'Take 1-2 softgels daily with meals.', storageInstructions: 'Store in refrigerator after opening.', isFeatured: true, tags: ['omega 3', 'fish oil', 'heart health', 'brain'], images: ['https://placehold.co/400x400/00BCD4/white?text=Omega-3'], rating: 4.6, numReviews: 95 },
  { name: 'Digital Blood Pressure Monitor', genericName: 'BP Monitor', description: 'Accurate and easy-to-use upper arm blood pressure monitor with large LCD display, irregular heartbeat detection, and memory for 60 readings. WHO blood pressure classification indicator.', manufacturer: 'Omron', category: 'Medical Devices', subcategory: 'Blood Pressure', price: 2999, discountPrice: 2499, stock: 45, unit: 'piece', packSize: '1 unit', prescriptionRequired: false, usageInstructions: 'Sit quietly for 5 minutes before measurement. Apply cuff to upper arm.', storageInstructions: 'Store at room temperature. Avoid extreme temperatures.', isFeatured: true, tags: ['bp monitor', 'blood pressure', 'omron', 'digital'], images: ['https://placehold.co/400x400/9C27B0/white?text=BP+Monitor'], rating: 4.8, numReviews: 320 },
  { name: 'Cetirizine 10mg', genericName: 'Cetirizine Hydrochloride', description: 'Non-drowsy antihistamine tablet for relief from allergic rhinitis, hay fever, skin allergies, and hives. Provides 24-hour relief from sneezing, runny nose, and itching.', manufacturer: 'Mankind', category: 'OTC Medicines', subcategory: 'Allergy', price: 55, discountPrice: 44, stock: 400, unit: 'strip', packSize: '10 tablets', prescriptionRequired: false, saltComposition: 'Cetirizine 10mg', dosageForm: 'Tablet', strength: '10mg', usageInstructions: '1 tablet once daily, preferably in the evening.', isFeatured: false, tags: ['cetirizine', 'allergy', 'antihistamine', 'hay fever'], images: ['https://placehold.co/400x400/E91E63/white?text=Cetirizine'], rating: 4.4, numReviews: 87 },
  { name: 'Baby Diaper Rash Cream', genericName: 'Zinc Oxide Cream', description: 'Gentle and effective diaper rash cream with zinc oxide, vitamin E, and aloe vera. Provides a protective barrier against moisture, soothes existing rash and prevents recurrence.', manufacturer: 'Johnson\'s Baby', category: 'Baby Care', subcategory: 'Baby Skincare', price: 220, discountPrice: 195, stock: 120, unit: 'tube', packSize: '50g', prescriptionRequired: false, usageInstructions: 'Apply a thin layer at each diaper change on clean, dry skin.', isFeatured: false, tags: ['baby', 'diaper rash', 'zinc oxide', 'baby cream'], images: ['https://placehold.co/400x400/FFEB3B/black?text=Baby+Cream'], rating: 4.5, numReviews: 156 },
  { name: 'Glucometer with 25 Test Strips', genericName: 'Blood Glucose Monitor', description: 'Compact and accurate blood glucose monitoring system. Results in 5 seconds, requires only 0.5μL blood sample. Stores 500 test results with date and time. USB data transfer capability.', manufacturer: 'Accu-Chek', category: 'Medical Devices', subcategory: 'Diabetes Care', price: 1599, discountPrice: 1299, stock: 60, unit: 'kit', packSize: '1 glucometer + 25 strips', prescriptionRequired: false, usageInstructions: 'Clean finger with alcohol swab, prick with lancet, apply blood to test strip.', isFeatured: true, tags: ['glucometer', 'blood sugar', 'diabetes', 'accu-chek'], images: ['https://placehold.co/400x400/795548/white?text=Glucometer'], rating: 4.7, numReviews: 445 },
  { name: 'Ashwagandha KSM-66 Extract 600mg', genericName: 'Withania somnifera', description: 'Premium KSM-66 ashwagandha root extract, the most concentrated full-spectrum ashwagandha. Clinically proven to reduce stress, improve energy, and support testosterone levels.', manufacturer: 'OZiva', category: 'Ayurvedic & Herbal', subcategory: 'Stress & Anxiety', price: 899, discountPrice: 719, stock: 95, unit: 'bottle', packSize: '60 capsules', prescriptionRequired: false, dosageForm: 'Capsule', usageInstructions: 'Take 1 capsule twice daily with meals.', isFeatured: true, tags: ['ashwagandha', 'ksm-66', 'stress', 'ayurvedic', 'adaptogen'], images: ['https://placehold.co/400x400/8BC34A/white?text=Ashwagandha'], rating: 4.6, numReviews: 234 },
  { name: 'N95 Face Mask (Pack of 10)', genericName: 'N95 Respirator Mask', description: 'NIOSH approved N95 respirator masks providing 95% filtration efficiency for airborne particles. 5-layer protection with adjustable nose clip, comfortable foam nose cushion, and latex-free elastic straps.', manufacturer: '3M', category: 'COVID Essentials', subcategory: 'Masks', price: 499, discountPrice: 399, stock: 500, unit: 'pack', packSize: '10 masks', prescriptionRequired: false, usageInstructions: 'Adjust nose clip, perform user seal check before each use.', isFeatured: false, tags: ['n95', 'mask', 'respirator', '3m', 'covid'], images: ['https://placehold.co/400x400/607D8B/white?text=N95+Mask'], rating: 4.5, numReviews: 678 },
  { name: 'Multivitamin & Mineral Complex', genericName: 'Multivitamin', description: 'Comprehensive daily multivitamin with 25 essential vitamins and minerals. Supports immunity, energy metabolism, bone health, and overall wellbeing. Suitable for men and women above 18 years.', manufacturer: 'Centrum', category: 'Vitamins & Supplements', subcategory: 'Multivitamins', price: 749, discountPrice: 599, stock: 280, unit: 'bottle', packSize: '60 tablets', prescriptionRequired: false, dosageForm: 'Tablet', usageInstructions: '1 tablet daily with a meal.', isFeatured: true, tags: ['multivitamin', 'minerals', 'immunity', 'centrum'], images: ['https://placehold.co/400x400/FF5722/white?text=Multivitamin'], rating: 4.4, numReviews: 189 },
  { name: 'Pulse Oximeter Fingertip', genericName: 'SpO2 Monitor', description: 'Clinical-grade fingertip pulse oximeter measuring blood oxygen saturation and pulse rate accurately. Large OLED display with 4-direction rotation, auto power-off, and low battery indicator.', manufacturer: 'Dr. Trust', category: 'Medical Devices', subcategory: 'Oxygen Monitor', price: 899, discountPrice: 749, stock: 85, unit: 'piece', packSize: '1 unit', prescriptionRequired: false, usageInstructions: 'Insert finger into device, remain still for accurate reading.', isFeatured: false, tags: ['pulse oximeter', 'spo2', 'oxygen monitor', 'pulse rate'], images: ['https://placehold.co/400x400/3F51B5/white?text=Oximeter'], rating: 4.6, numReviews: 392 },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Seeding database...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'PharmaEZ Admin',
      email: 'admin@pharmaez.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999',
    });
    console.log(`✅ Admin user created: ${adminUser.email} / admin123`);

    // Create sample customer
    await User.create({
      name: 'Raj Kumar',
      email: 'raj@example.com',
      password: 'user123',
      role: 'user',
      phone: '9876543210',
      addresses: [{ fullName: 'Raj Kumar', phone: '9876543210', street: '12, MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', isDefault: true }],
    });
    console.log('✅ Sample user created: raj@example.com / user123');

    // Insert products
    await Product.insertMany(sampleProducts);
    console.log(`✅ ${sampleProducts.length} sample products inserted`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('  Admin: admin@pharmaez.com / admin123');
    console.log('  User:  raj@example.com / user123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
