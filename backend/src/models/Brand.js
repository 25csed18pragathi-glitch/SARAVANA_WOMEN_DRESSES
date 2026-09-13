import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: [true, 'Brand slug is required'],
      trim: true,
      lowercase: true,
      unique: true
    },
    tagline: {
      type: String,
      default: ''
    },
    logo: {
      type: String,
      default: ''
    },
    accentColor: {
      type: String,
      default: '#9B2242'
    },
    description: {
      type: String,
      default: ''
    },
    bannerImage: {
      type: String,
      default: ''
    },
    itemCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

brandSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
