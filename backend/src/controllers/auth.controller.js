import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const ensureDbConnected = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message: 'Database is connecting. Please ensure your IP is whitelisted in MongoDB Atlas Network Access.'
    });
    return false;
  }
  return true;
};

// Generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

/**
 * @desc    Register a new customer
 * @route   POST /api/auth/register
 */
export const register = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { name, fullName, email, password, confirmPassword, phone } = req.body;
    const customerName = (name || fullName || '').trim();

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full name'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const user = await User.create({
      name: customerName,
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : '',
      role: 'customer'
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        addresses: user.addresses || [],
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error registering account'
    });
  }
};

/**
 * @desc    Login user / admin
 * @route   POST /api/auth/login
 */
export const login = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        addresses: user.addresses || [],
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error logging in'
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile'
    });
  }
};

/**
 * @desc    Update customer profile
 * @route   PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, phone, avatar } = req.body;
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar) user.avatar = avatar.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 */
export const changePassword = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match'
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error changing password'
    });
  }
};

/**
 * @desc    Get all addresses of logged-in user
 * @route   GET /api/auth/addresses
 */
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    return res.status(200).json({
      success: true,
      data: user ? user.addresses : []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching addresses'
    });
  }
};

/**
 * @desc    Add a delivery address
 * @route   POST /api/auth/addresses
 */
export const addAddress = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const {
      fullName,
      name,
      phone,
      houseBuilding,
      street,
      area,
      city,
      state,
      pincode,
      type,
      isDefault
    } = req.body;

    if (!street || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Street address, city, and pincode are required'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const shouldBeDefault = isDefault || user.addresses.length === 0;

    if (shouldBeDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      fullName: fullName || name || user.name,
      name: name || fullName || user.name,
      phone: phone || user.phone || '',
      houseBuilding: houseBuilding || '',
      street: street.trim(),
      area: area || '',
      city: city.trim(),
      state: state || 'Tamil Nadu',
      pincode: pincode.trim(),
      type: type || 'Home',
      isDefault: shouldBeDefault
    };

    user.addresses.push(newAddress);
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('Add address error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error adding address'
    });
  }
};

/**
 * @desc    Update an address
 * @route   PUT /api/auth/addresses/:addressId
 */
export const updateAddress = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { addressId } = req.params;
    const {
      fullName,
      name,
      phone,
      houseBuilding,
      street,
      area,
      city,
      state,
      pincode,
      type,
      isDefault
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    } else if (isDefault === false && address.isDefault && user.addresses.length > 1) {
      address.isDefault = false;
      const other = user.addresses.find((a) => a._id.toString() !== addressId);
      if (other) other.isDefault = true;
    }

    if (fullName) address.fullName = fullName;
    if (name) address.name = name;
    if (phone !== undefined) address.phone = phone;
    if (houseBuilding !== undefined) address.houseBuilding = houseBuilding;
    if (street) address.street = street.trim();
    if (area !== undefined) address.area = area;
    if (city) address.city = city.trim();
    if (state) address.state = state;
    if (pincode) address.pincode = pincode.trim();
    if (type) address.type = type;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('Update address error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating address'
    });
  }
};

/**
 * @desc    Delete an address
 * @route   DELETE /api/auth/addresses/:addressId
 */
export const deleteAddress = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.addresses.findIndex((a) => a._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting address'
    });
  }
};

/**
 * @desc    Set address as default
 * @route   PATCH /api/auth/addresses/:addressId/default
 */
export const setDefaultAddress = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let found = false;
    user.addresses.forEach((addr) => {
      if (addr._id.toString() === addressId) {
        addr.isDefault = true;
        found = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('Set default address error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating default address'
    });
  }
};
