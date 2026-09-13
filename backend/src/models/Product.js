import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, default: '#000000' }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    finalPrice: {
      type: Number,
      min: [0, 'Final price must be a positive number']
    },
    images: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true
    },
    categorySlug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    categoryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true
    },
    brand: {
      type: String,
      default: 'Saravana Silk Heritage',
      trim: true
    },
    brandSlug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    brandRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      index: true
    },
    sizes: {
      type: [String],
      default: ['Free Size']
    },
    colors: {
      type: [colorSchema],
      default: []
    },
    stock: {
      type: Number,
      default: 10,
      min: [0, 'Stock cannot be negative']
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative']
    },
    availability: {
      type: String,
      default: 'In Stock',
      enum: ['In Stock', 'Out of Stock', 'Limited Stock', 'Only 1 Left', 'Only 2 Left', 'Only 3 Left']
    },
    isBestSeller: {
      type: Boolean,
      default: false
    },
    isTrending: {
      type: Boolean,
      default: false
    },
    isNew: {
      type: Boolean,
      default: false
    },
    recentlyAdded: {
      type: Boolean,
      default: false
    },
    fabric: {
      type: String,
      default: ''
    },
    care: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    suppressReservedKeysWarning: true
  }
);

// Pre-save calculation for finalPrice and slug generation
productSchema.pre('save', function (next) {
  if (!this.finalPrice || this.isModified('price') || this.isModified('discount')) {
    if (this.discount > 0) {
      this.finalPrice = Math.round(this.price * (1 - this.discount / 100));
    } else {
      this.finalPrice = this.price;
    }
  }

  // Calculate availability if stock modified
  if (this.isModified('stock')) {
    if (this.stock <= 0) {
      this.availability = 'Out of Stock';
    } else if (this.stock === 1) {
      this.availability = 'Only 1 Left';
    } else if (this.stock === 2) {
      this.availability = 'Only 2 Left';
    } else if (this.stock === 3) {
      this.availability = 'Only 3 Left';
    } else if (this.stock <= 5) {
      this.availability = 'Limited Stock';
    } else {
      this.availability = 'In Stock';
    }
  }

  // Ensure categorySlug
  if (this.category && !this.categorySlug) {
    this.categorySlug = this.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  // Ensure brandSlug
  if (this.brand && !this.brandSlug) {
    this.brandSlug = this.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  if (typeof next === 'function') {
    next();
  }
});

// Virtual getters for frontend backwards compatibility
productSchema.virtual('id').get(function () {
  return this.customId || this._id.toHexString();
});

productSchema.virtual('image').get(function () {
  return this.images && this.images.length > 0 ? this.images[0] : '';
});

productSchema.virtual('originalPrice').get(function () {
  return this.price;
});

productSchema.virtual('sellingPrice').get(function () {
  return this.finalPrice || this.price;
});

productSchema.virtual('stockStatus').get(function () {
  return this.availability;
});

productSchema.virtual('reviews').get(function () {
  return this.reviewCount;
});

// Text indexing for comprehensive multi-field search
productSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  brand: 'text',
  fabric: 'text'
});

const Product = mongoose.model('Product', productSchema);

export default Product;
