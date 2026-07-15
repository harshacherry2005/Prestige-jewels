const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

// Register User
exports.signUp = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // First user is admin (helpful for local setup testing)
    const allUsers = await User.find({});
    const role = allUsers.length === 0 ? 'admin' : 'user';

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      wishlist: [],
      addresses: []
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist,
        addresses: user.addresses
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error during sign up' });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist,
        addresses: user.addresses
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error during login' });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Omit password when returning profile
    const profile = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wishlist: user.wishlist || [],
      addresses: user.addresses || []
    };
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error fetching profile' });
  }
};

// Update Wishlist
exports.updateWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    let wishlist = user.wishlist || [];
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
    } else {
      wishlist.push(productId);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { wishlist },
      { new: true }
    );

    res.json({ wishlist: updatedUser.wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error updating wishlist' });
  }
};

// Update Addresses
exports.updateAddresses = async (req, res) => {
  const { addresses } = req.body; // Full addresses array
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { addresses },
      { new: true }
    );
    res.json({ addresses: updatedUser.addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error updating addresses' });
  }
};
