const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  session: { type: String, required: true },
  phone: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  
  // Additional fields from admission form
  roll: { type: String },
  dob: { type: Date },
  nid: { type: String },
  bloodGroup: { type: String },
  semester: { type: String },
  cgpa: { type: Number },
  presentAddress: { type: String },
  distanceFromHome: { type: Number },
  guardianName: { type: String },
  guardianRelation: { type: String },
  guardianPhone: { type: String },
  guardianOccupation: { type: String },
  quotas: [{ type: String }],
  bankName: { type: String, default: 'Sonali Bank' },
  branchName: { type: String },
  accountNumber: { type: String },
  receiptNumber: { type: String },
  paymentDate: { type: Date },
  
  // Application metadata
  admissionStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  seatNumber: { type: String, default: null },
  roomNumber: { type: String, default: null },
  admissionDate: { type: Date, default: Date.now },
  profileImage: { type: String }
});

module.exports = mongoose.model('Student', studentSchema);