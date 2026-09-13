import Product from '../models/Product.js';
import Category from '../models/Category.js';
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
 * @desc    Create a new product
 * @route   POST /api/products
 */
export const createProduct = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const {
      name,
      description,
      price,
      discount,
      finalPrice,
      images,
      category,
      categorySlug,
      categoryRef,
      brand,
      brandSlug,
      brandRef,
      sizes,
      colors,
      stock,
      rating,
      reviewCount,
      availability,
      customId,
      isBestSeller,
      isTrending,
      isNew,
      recentlyAdded,
      fabric,
      care
    } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and category for the product'
      });
    }

    const calculatedFinalPrice =
      finalPrice !== undefined
        ? Number(finalPrice)
        : discount > 0
        ? Math.round(Number(price) * (1 - Number(discount) / 100))
        : Number(price);

    const resolvedCategorySlug = categorySlug || category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const resolvedBrandSlug = brandSlug || (brand ? brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'saravana-silk-heritage');

    // Resolve categoryRef if not explicitly provided
    let finalCategoryRef = categoryRef;
    if (!finalCategoryRef && category) {
      const catDoc = await Category.findOne({
        $or: [{ name: new RegExp(`^${category}$`, 'i') }, { slug: resolvedCategorySlug }]
      });
      if (catDoc) finalCategoryRef = catDoc._id;
    }

    // Resolve brandRef if not explicitly provided
    let finalBrandRef = brandRef;
    if (!finalBrandRef && brand) {
      const brandDoc = await Brand.findOne({
        $or: [{ name: new RegExp(`^${brand}$`, 'i') }, { slug: resolvedBrandSlug }]
      });
      if (brandDoc) finalBrandRef = brandDoc._id;
    }

    const product = await Product.create({
      customId: customId || `prod-${Date.now().toString().slice(-6)}`,
      name,
      description: description || '',
      price: Number(price),
      discount: Number(discount) || 0,
      finalPrice: calculatedFinalPrice,
      images: Array.isArray(images) ? images : images ? [images] : [],
      category,
      categorySlug: resolvedCategorySlug,
      categoryRef: finalCategoryRef,
      brand: brand || 'Saravana Silk Heritage',
      brandSlug: resolvedBrandSlug,
      brandRef: finalBrandRef,
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['Free Size'],
      colors: Array.isArray(colors) ? colors : [],
      stock: stock !== undefined ? Number(stock) : 10,
      rating: rating !== undefined ? Number(rating) : 4.5,
      reviewCount: reviewCount !== undefined ? Number(reviewCount) : 0,
      availability: availability || 'In Stock',
      isBestSeller: isBestSeller === true,
      isTrending: isTrending === true,
      isNew: isNew === true,
      recentlyAdded: recentlyAdded === true,
      fabric: fabric || '',
      care: care || ''
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all products with full filtering, search, sorting and pagination
 * @route   GET /api/products
 */
export const getAllProducts = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const {
      search,
      q,
      category,
      categorySlug,
      brand,
      brandSlug,
      minPrice,
      maxPrice,
      size,
      color,
      availability,
      minRating,
      isBestSeller,
      isTrending,
      isNew,
      recentlyAdded,
      sort,
      page = 1,
      limit = 50
    } = req.query;

    const filter = {};

    // Keyword text search (supports query or q param)
    const searchTerm = search || q;
    if (searchTerm && searchTerm.trim() !== '') {
      const regex = new RegExp(searchTerm.trim(), 'i');
      filter.$or = [
        { name: regex },
        { description: regex },
        { category: regex },
        { brand: regex },
        { fabric: regex }
      ];
    }

    // Category filter
    const catQuery = category || categorySlug;
    if (catQuery && catQuery !== 'all') {
      filter.$or = filter.$or || [];
      const catRegex = new RegExp(`^${catQuery}$`, 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [{ category: catRegex }, { categorySlug: catQuery.toLowerCase() }]
      });
    }

    // Brand filter
    const brandQuery = brand || brandSlug;
    if (brandQuery && brandQuery !== 'all') {
      const brandRegex = new RegExp(`^${brandQuery}$`, 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [{ brand: brandRegex }, { brandSlug: brandQuery.toLowerCase() }]
      });
    }

    // Price range filter on finalPrice
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.finalPrice = {};
      if (minPrice !== undefined && minPrice !== '') {
        filter.finalPrice.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        filter.finalPrice.$lte = Number(maxPrice);
      }
    }

    // Size filter
    if (size) {
      filter.sizes = { $in: [size] };
    }

    // Color filter
    if (color) {
      const colorLower = color.toLowerCase();
      let colorPattern = color;
      if (colorLower === 'red') colorPattern = 'red|crimson|maroon|ruby|scarlet';
      else if (colorLower === 'blue') colorPattern = 'blue|teal|navy|indigo|sapphire';
      else if (colorLower === 'green') colorPattern = 'green|emerald|olive|sage|mint';
      else if (colorLower === 'pink') colorPattern = 'pink|rose|blush|magenta|peach';
      else if (colorLower === 'gold') colorPattern = 'gold|yellow|mustard|zari';
      filter['colors.name'] = new RegExp(colorPattern, 'i');
    }

    // Availability filter
    if (availability) {
      if (availability.toLowerCase() === 'in stock') {
        filter.stock = { $gt: 0 };
      } else {
        filter.availability = new RegExp(availability, 'i');
      }
    }

    // Rating filter
    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    // Special collections filters
    if (isBestSeller === 'true') filter.isBestSeller = true;
    if (isTrending === 'true') filter.isTrending = true;
    if (isNew === 'true') filter.isNew = true;
    if (recentlyAdded === 'true') filter.recentlyAdded = true;

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    switch (sort) {
      case 'price-asc':
      case 'price-low':
        sortOption = { finalPrice: 1 };
        break;
      case 'price-desc':
      case 'price-high':
        sortOption = { finalPrice: -1 };
        break;
      case 'rating':
      case 'rating-high':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
      case 'bestseller':
        sortOption = { reviewCount: -1, rating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('categoryRef', 'name slug image description')
      .populate('brandRef', 'name slug logo accentColor')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single product by ID or customId
 * @route   GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { id } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
        .populate('categoryRef', 'name slug image description')
        .populate('brandRef', 'name slug logo accentColor');
    }
    if (!product) {
      product = await Product.findOne({
        $or: [{ customId: id }, { customId: id.toLowerCase() }]
      })
        .populate('categoryRef', 'name slug image description')
        .populate('brandRef', 'name slug logo accentColor');
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update product by ID or customId
 * @route   PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { id } = req.params;
    let query = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { customId: id };
    }

    // Resolve categoryRef if category name or slug is modified
    if (req.body.category && !req.body.categoryRef) {
      const catSlug = req.body.categorySlug || req.body.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const catDoc = await Category.findOne({
        $or: [{ name: new RegExp(`^${req.body.category}$`, 'i') }, { slug: catSlug }]
      });
      if (catDoc) req.body.categoryRef = catDoc._id;
    }

    // Resolve brandRef if brand name or slug is modified
    if (req.body.brand && !req.body.brandRef) {
      const bSlug = req.body.brandSlug || req.body.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const brandDoc = await Brand.findOne({
        $or: [{ name: new RegExp(`^${req.body.brand}$`, 'i') }, { slug: bSlug }]
      });
      if (brandDoc) req.body.brandRef = brandDoc._id;
    }

    // If price or discount changed, recompute finalPrice
    if (req.body.price !== undefined || req.body.discount !== undefined) {
      const current = await Product.findOne(query);
      if (current) {
        const newPrice = req.body.price !== undefined ? Number(req.body.price) : current.price;
        const newDiscount = req.body.discount !== undefined ? Number(req.body.discount) : current.discount;
        if (!req.body.finalPrice) {
          req.body.finalPrice = newDiscount > 0
            ? Math.round(newPrice * (1 - newDiscount / 100))
            : newPrice;
        }
      }
    }

    const product = await Product.findOneAndUpdate(query, req.body, {
      returnDocument: 'after',
      runValidators: true
    })
      .populate('categoryRef', 'name slug image description')
      .populate('brandRef', 'name slug logo accentColor');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete product by ID or customId
 * @route   DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { id } = req.params;
    let query = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { customId: id };
    }

    const product = await Product.findOneAndDelete(query);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
