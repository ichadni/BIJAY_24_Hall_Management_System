const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
    unique: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  floor: { type: Number },
  isOccupied: {
    type: Boolean,
    default: false
  },
  occupiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  allocatedAt: { type: Date },
  seatType: {
    type: String,
    enum: ['single', 'shared'],
    default: 'single'
  }
});

module.exports = mongoose.model('Seat', seatSchema);