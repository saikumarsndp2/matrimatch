require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.log('❌ MongoDB Error:', err));

app.get('/', (req, res) => res.json({ message: 'matrimonial + MongoDB OK!' }));
app.get('/test-db', (req, res) => res.json({ dbStatus: 'MongoDB Test Route WORKING ✅' }));

app.listen(3000, () => console.log('🚀 Server on http://localhost:3000'));
