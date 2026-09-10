const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
  type: String,
  // Remove the enum validation entirely
  // enum: ['admin', 'staff', 'student'],  // COMMENT THIS OUT
  default: 'student'
},
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  department: { type: String },
  phone: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// CORRECT async implementation - NO next parameter
userSchema.pre('save', async function() {
  console.log('=== PRE-SAVE HOOK STARTED ===');
  console.log('Password modified:', this.isModified('password'));
  
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hash');
    return;
  }
  
  try {
    console.log('Starting password hashing process...');
    console.log('Original password (first 3 chars):', this.password.substring(0, 3));
    
    const salt = await bcrypt.genSalt(10);
    console.log('Salt generated');
    
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    
    console.log('Password hashed successfully!');
    console.log('Hashed password starts with:', this.password.substring(0, 10));
    console.log('=== PRE-SAVE HOOK COMPLETED ===');
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error(`Password hashing failed: ${error.message}`);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  console.log('Comparing passwords...');
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log('Password match result:', isMatch);
  return isMatch;
};

module.exports = mongoose.model('User', userSchema);