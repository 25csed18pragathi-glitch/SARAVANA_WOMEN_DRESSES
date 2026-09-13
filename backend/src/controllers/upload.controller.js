import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${cleanName}-${Date.now()}${ext}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|svg/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp, gif, svg) are allowed'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter
});

/**
 * @desc    Upload single or multiple images
 * @route   POST /api/upload
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const files = req.files ? req.files : [req.file];
    const uploadFolder = req.body?.folder || 'saravana-women-dresses/products';
    const urls = [];

    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (isCloudinaryConfigured) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
    }

    for (const f of files) {
      if (isCloudinaryConfigured) {
        try {
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(f.path, { folder: uploadFolder, resource_type: 'image' }, (error, response) => {
              if (error) reject(error);
              else resolve(response);
            });
          });
          urls.push(result.secure_url);
          fs.unlink(f.path, () => {});
        } catch (cloudErr) {
          console.error('Cloudinary upload failed:', cloudErr.message);
          return res.status(502).json({ success: false, message: 'Cloudinary upload failed' });
        }
      } else {
        // Local static file serving path
        urls.push(`${req.protocol}://${req.get('host')}/uploads/${f.filename}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: urls[0],
        urls
      }
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Image upload failed'
    });
  }
};
