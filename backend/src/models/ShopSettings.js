import mongoose from 'mongoose';

const shopSettingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: 'default', unique: true, immutable: true },
    shopName: { type: String, default: 'Women\'s Fashion Store', trim: true },
    logoUrl: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    whatsapp: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    address: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    pincode: { type: String, default: '', trim: true },
    mapLink: { type: String, default: '', trim: true },
    instagramLink: { type: String, default: '', trim: true },
    facebookLink: { type: String, default: '', trim: true },
    websiteLink: { type: String, default: '', trim: true },
    businessDescription: { type: String, default: '', trim: true },
    customerSupport: { type: String, default: '', trim: true },
    returnRefundPolicy: { type: String, default: '', trim: true }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('ShopSettings', shopSettingsSchema);
