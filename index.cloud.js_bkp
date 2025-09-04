const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Only one block for app, schemas, and models
const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://sarathydinesh:ePwaoLSXaXyxtJKi@cluster0.tatgrvu.mongodb.net/tailors', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  loginType: { type: String, enum: ['tailor', 'customer'], required: true },
  password: { type: String, required: true },
  status: { type: String, default: 'active' },
});

const tailorProfileSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  name: String,
  address: String,
  experience: String,
  facebook: String,
  instagram: String,
  images: [String], // store image URLs or base64 strings
});

const tailorGallerySchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  image: { type: String, required: true }, // URL or base64
  uploadedAt: { type: Date, default: Date.now }
});

const customerProfileSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  name: String,
  email: String,
  profileImage: String, // URL or base64
});

const User = mongoose.model('user_cred', userSchema);
const TailorProfile = mongoose.model('tailor_profiles', tailorProfileSchema);
const TailorGallery = mongoose.model('tailor_gallery', tailorGallerySchema);
const CustomerProfile = mongoose.model('customer_profiles', customerProfileSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  });
}

// Get customer profile
app.get('/customer/profile', async (req, res) => {
  const { mobile } = req.query;
  if (!mobile) return res.status(400).json({ message: 'Mobile number required.' });
  try {
    const profile = await CustomerProfile.findOne({ mobile });
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    res.status(200).json({ profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update customer profile (except mobile)
app.post('/customer/profile', async (req, res) => {
  const { mobile, name, email, profileImage } = req.body;
  if (!mobile) return res.status(400).json({ message: 'Mobile number required.' });
  try {
    const profile = await CustomerProfile.findOneAndUpdate(
      { mobile },
      { name, email, profileImage },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'Profile updated.', profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get tailor profile
app.get('/tailor/profile', async (req, res) => {
  const { mobile } = req.query;
  if (!mobile) return res.status(400).json({ message: 'Mobile number required.' });
  try {
    const profile = await TailorProfile.findOne({ mobile });
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    res.status(200).json({ profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Upload gallery image
app.post('/tailor/gallery/upload', async (req, res) => {
  const { mobile, image } = req.body;
  if (!mobile || !image) return res.status(400).json({ message: 'Mobile and image required.' });
  try {
    const galleryImage = new TailorGallery({ mobile, image });
    await galleryImage.save();
    res.status(200).json({ message: 'Gallery image uploaded.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all gallery images for a tailor
app.get('/tailor/gallery', async (req, res) => {
  const { mobile } = req.query;
  if (!mobile) return res.status(400).json({ message: 'Mobile number required.' });
  try {
    const images = await TailorGallery.find({ mobile }).sort({ uploadedAt: -1 });
    res.status(200).json({ images });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// Save or update tailor profile
app.post('/tailor/profile', authenticateToken, async (req, res) => {
  const { mobile, name, address, experience, facebook, instagram } = req.body;
  if (!mobile) return res.status(400).json({ message: 'Mobile number required.' });
  try {
    const profile = await TailorProfile.findOneAndUpdate(
      { mobile },
      { name, address, experience, facebook, instagram },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'Profile saved.', profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Upload tailor image
app.post('/tailor/upload', async (req, res) => {
  const { mobile, image } = req.body;
  if (!mobile || !image) return res.status(400).json({ message: 'Mobile and image required.' });
  try {
    const profile = await TailorProfile.findOne({ mobile });
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    profile.images.push(image); // image should be a URL or base64 string
    await profile.save();
    res.status(200).json({ message: 'Image uploaded.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Registration endpoint
app.post('/register', async (req, res) => {
  const { mobile, name, loginType, password } = req.body;
  if (!mobile || !name || !loginType || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const existing = await User.findOne({ mobile });
    if (existing) {
      return res.status(409).json({ message: 'Mobile number already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ mobile, name, loginType, password: hashedPassword, status: 'active' });
    await user.save();

    // Create or update profile in customer_profile or tailor_profile
    if (loginType === 'customer') {
      await CustomerProfile.findOneAndUpdate(
        { mobile },
        { name },
        { upsert: true, new: true }
      );
    } else if (loginType === 'tailor') {
      await TailorProfile.findOneAndUpdate(
        { mobile },
        { name },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({ message: 'Registration successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update login endpoint to return JWT
app.post('/login', async (req, res) => {
  const { mobile, password } = req.body;
  try {
    const user = await User.findOne({ mobile });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });
    // Generate JWT
    const token = jwt.sign({ mobile: user.mobile, loginType: user.loginType, name: user.name }, JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({ message: 'Login successful.', user: { mobile: user.mobile, name: user.name, loginType: user.loginType }, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Cloud backend server running on port ${PORT}`);
});
