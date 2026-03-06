require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); // ADD THIS
const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Test User Registration
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, age, gender, religion, location, profession } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name, email, password, age, gender, religion, location, profession
    });

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Test routes
app.get('/', (req, res) => res.json({ message: 'MatriMatch API Ready!' }));
app.get('/test-db', (req, res) => res.json({ dbStatus: 'MongoDB Test Route WORKING ✅' }));

// USER REGISTRATION ROUTE - ADD THIS!
app.post('/api/users/register', async (req, res) => {
  try {
    const User = require('./models/User');
    const { name, email, password, age, gender, religion, location, profession } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name, email, password, age, gender, religion, location, profession
    });

    res.status(201).json({
      message: 'User registered successfully!',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET USER BY ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.listen(3000, () => console.log('🚀 Server on http://localhost:3000'));
