import Brand from '../models/Brand.js';
import mongoose from 'mongoose';

const ensureDbConnected = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message: 'Database is connecting. Please ensure your IP is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0 or 223.181.223.69).'
    });
    return false;
  }
  return true;
};

/**
 * @desc    Create a new brand
 * @route   POST /api/brands
 */
export const createBrand = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { name, slug, tagline, logo, accentColor, description, bannerImage, itemCount } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Brand name is required' });
    }

    const calculatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingBrand = await Brand.findOne({
      $or: [{ name: new RegExp(`^${name}$`, 'i') }, { slug: calculatedSlug }]
    });

    if (existingBrand) {
      return res.status(409).json({ success: false, message: 'Brand with this name or slug already exists' });
    }

    const brand = await Brand.create({
      name,
      slug: calculatedSlug,
      tagline: tagline || '',
      logo: logo || name.toUpperCase(),
      accentColor: accentColor || '#9B2242',
      description: description || '',
      bannerImage: bannerImage || '',
      itemCount: itemCount || 0
    });

    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all brands
 * @route   GET /api/brands
 */
export const getAllBrands = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: brands.length, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get brand by ID or slug
 * @route   GET /api/brands/:id
 */
export const getBrandById = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { id } = req.params;
    let brand = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      brand = await Brand.findById(id);
    }
    if (!brand) {
      brand = await Brand.findOne({ slug: id.toLowerCase() });
    }

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update brand by ID or slug
 * @route   PUT /api/brands/:id
 */
export const updateBrand = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { id } = req.params;
    let query = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id.toLowerCase() };
    }

    const brand = await Brand.findOneAndUpdate(query, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete brand by ID or slug
 * @route   DELETE /api/brands/:id
 */
export const deleteBrand = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { id } = req.params;
    let query = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id.toLowerCase() };
    }

    const brand = await Brand.findOneAndDelete(query);

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    res.status(200).json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
