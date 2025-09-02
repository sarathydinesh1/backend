// Customer profile schema and model
const customerProfileSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  name: String,
  email: String,
  profileImage: String, // URL or base64
});
const CustomerProfile = mongoose.model('customer_profiles', customerProfileSchema);

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
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/tailors', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//mongodb+srv://sarathydinesh:<db_password>@cluster0.tatgrvu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
//mongoose.connect('mongodb+srv://sarathydinesh:ePwaoLSXaXyxtJKi@cluster0.tatgrvu.mongodb.net/tailors', {

const userSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  loginType: { type: String, enum: ['tailor', 'customer'], required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('user_cred', userSchema);

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
    const user = new User({ mobile, name, loginType, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Registration successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    return res.status(400).json({ message: 'Mobile and password required.' });
  }
  try {
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    res.status(200).json({ message: 'Login successful.', user: { mobile: user.mobile, name: user.name, loginType: user.loginType } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


//mongodb+srv://<db_username>:<db_password>@cluster0.tatgrvu.mongodb.net/
//mongodb+srv://sarathydinesh:<db_password>@cluster0.tatgrvu.mongodb.net/