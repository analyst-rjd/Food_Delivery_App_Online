const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/vendors/register
// @desc    Register a vendor
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, businessName, phone, address } = req.body;

    // Check if vendor exists
    const existingVendor = await Vendor.findOne({ email });

    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create vendor
    const vendor = await Vendor.create({
      email,
      password,
      businessName,
      phone,
      address
    });

    sendTokenResponse(vendor, 201, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/vendors/login
// @desc    Login vendor
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for vendor
    const vendor = await Vendor.findOne({ email }).select('+password');

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await vendor.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(vendor, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/vendors/me
// @desc    Get current logged in vendor
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor.id);

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/vendors/profile
// @desc    Update vendor profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const fieldsToUpdate = {
      businessName: req.body.businessName,
      phone: req.body.phone,
      address: req.body.address
    };

    const vendor = await Vendor.findByIdAndUpdate(req.vendor.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/vendors/profile-image
// @desc    Upload vendor profile image
// @access  Private
router.put('/profile-image', protect, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.vendor.id,
      { profileImage: `/uploads/${req.file.filename}` },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/vendors/logout
// @desc    Log vendor out / clear cookie
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (vendor, statusCode, res) => {
  // Create token
  const token = vendor.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    vendor: {
      id: vendor._id,
      email: vendor.email,
      businessName: vendor.businessName
    }
  });
};

module.exports = router;