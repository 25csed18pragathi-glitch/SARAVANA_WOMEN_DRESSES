import ShopSettings from '../models/ShopSettings.js';

const PUBLIC_FIELDS = [
  'shopName',
  'logoUrl',
  'phone',
  'whatsapp',
  'email',
  'address',
  'city',
  'state',
  'pincode',
  'mapLink',
  'instagramLink',
  'facebookLink',
  'websiteLink',
  'businessDescription',
  'customerSupport',
  'returnRefundPolicy'
];

const getPublicSettings = (settings) => {
  const data = {};
  PUBLIC_FIELDS.forEach((field) => {
    data[field] = settings?.[field] || '';
  });
  return data;
};

export const getPublicShopSettings = async (req, res) => {
  try {
    const settings = await ShopSettings.findOne({ singletonKey: 'default' }).lean();
    return res.status(200).json({ success: true, data: getPublicSettings(settings) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch shop settings' });
  }
};

export const getAdminShopSettings = async (req, res) => {
  try {
    const settings = await ShopSettings.findOne({ singletonKey: 'default' }).lean();
    return res.status(200).json({ success: true, data: getPublicSettings(settings) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch shop settings' });
  }
};

export const updateShopSettings = async (req, res) => {
  try {
    const updates = {};
    PUBLIC_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = String(req.body[field]).trim();
    });

    const settings = await ShopSettings.findOneAndUpdate(
      { singletonKey: 'default' },
      { $set: updates, $setOnInsert: { singletonKey: 'default' } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({
      success: true,
      message: 'Shop settings updated successfully',
      data: getPublicSettings(settings)
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update shop settings' });
  }
};
