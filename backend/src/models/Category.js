import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      trim: true,
      lowercase: true,
      unique: true
    },
    image: {
      type: String,
      default: ''
    },
    itemCount: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      default: ''
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

categorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
