import Category from '../models/Category.js';
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
 * @desc    Create a new category
 * @route   POST /api/categories
 */
export const createCategory = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { name, slug, image, itemCount, description, featured } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const calculatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingCategory = await Category.findOne({
      $or: [{ name: new RegExp(`^${name}$`, 'i') }, { slug: calculatedSlug }]
    });

    if (existingCategory) {
      return res.status(409).json({ success: false, message: 'Category with this name or slug already exists' });
    }

    const category = await Category.create({
      name,
      slug: calculatedSlug,
      image: image || '',
      itemCount: itemCount || 0,
      description: description || '',
      featured: featured === true
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 */
export const getAllCategories = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const filter = {};
    if (req.query.featured !== undefined) {
      filter.featured = req.query.featured === 'true';
    }

    const categories = await Category.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get category by ID or slug
 * @route   GET /api/categories/:id
 */
export const getCategoryById = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { id } = req.params;
    let category = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await Category.findById(id);
    }
    if (!category) {
      category = await Category.findOne({ slug: id.toLowerCase() });
    }

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update category by ID or slug
 * @route   PUT /api/categories/:id
 */
export const updateCategory = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { id } = req.params;
    let query = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id.toLowerCase() };
    }

    const category = await Category.findOneAndUpdate(query, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete category by ID or slug
 * @route   DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { id } = req.params;
    let query = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id.toLowerCase() };
    }

    const category = await Category.findOneAndDelete(query);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
