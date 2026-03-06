const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  religion: { type: String, required: true },
  location: { type: String, required: true },
  profession: { type: String, required: true }
}, { timestamps: true });

// ✅ CORRECT: Pure async (NO next()!)
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model('User', userSchema);
