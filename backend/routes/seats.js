const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/seats
// @desc    Get all seats with availability
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const seats = await Seat.find().populate('occupiedBy', 'name studentId department');
    res.json({ success: true, count: seats.length, data: seats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/seats/available
// @desc    Get available seats only
// @access  Private
router.get('/available', protect, async (req, res) => {
  try {
    const seats = await Seat.find({ isOccupied: false });
    res.json({ success: true, count: seats.length, data: seats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/seats/seed
// @desc    Seed initial seats (admin only)
// @access  Private (admin)
router.post('/seed', protect, authorize('admin'), async (req, res) => {
  try {
    const { floors = 5, roomsPerFloor = 10, seatsPerRoom = 4 } = req.body;
    const seats = [];

    for (let floor = 1; floor <= floors; floor++) {
      for (let room = 1; room <= roomsPerFloor; room++) {
        const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
        for (let seat = 1; seat <= seatsPerRoom; seat++) {
          seats.push({
            seatNumber: `${roomNumber}-S${seat}`,
            roomNumber: roomNumber,
            floor: floor,
            seatType: seatsPerRoom > 1 ? 'shared' : 'single',
            isOccupied: false,
            occupiedBy: null
          });
        }
      }
    }

    // Clear existing seats
    await Seat.deleteMany({});
    
    // Insert new seats
    const result = await Seat.insertMany(seats);
    
    res.json({ 
      success: true, 
      message: `${result.length} seats seeded successfully`,
      data: {
        floors: floors,
        roomsPerFloor: roomsPerFloor,
        seatsPerRoom: seatsPerRoom,
        totalSeats: result.length
      }
    });
    
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/seats
// @desc    Add single seat (admin only)
// @access  Private (admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { seatNumber, roomNumber, floor, seatType } = req.body;

    const existing = await Seat.findOne({ seatNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Seat number already exists' });
    }

    const seat = await Seat.create({ 
      seatNumber, 
      roomNumber, 
      floor, 
      seatType,
      isOccupied: false,
      occupiedBy: null
    });
    
    res.status(201).json({ success: true, data: seat });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/seats/allocate/:studentId
// @desc    Allocate a seat to a student (admin/staff)
// @access  Private (admin, staff)
router.put('/allocate/:studentId', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { seatNumber } = req.body;
    const { studentId } = req.params;

    console.log('Allocation request:', { studentId, seatNumber });

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if admission is approved
    if (student.admissionStatus !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Student admission must be approved first' 
      });
    }

    // Find the seat
    const seat = await Seat.findOne({ seatNumber });
    if (!seat) {
      return res.status(404).json({ success: false, message: 'Seat not found' });
    }

    // Check if seat is occupied
    if (seat.isOccupied) {
      return res.status(400).json({ success: false, message: 'Seat already occupied' });
    }

    // Free previous seat if student had one
    if (student.seatNumber) {
      await Seat.findOneAndUpdate(
        { seatNumber: student.seatNumber },
        { isOccupied: false, occupiedBy: null, allocatedAt: null }
      );
    }

    // Assign new seat
    seat.isOccupied = true;
    seat.occupiedBy = student._id;
    seat.allocatedAt = new Date();
    await seat.save();

    // Update student with seat info
    student.seatNumber = seat.seatNumber;
    student.roomNumber = seat.roomNumber;
    await student.save();

    res.json({ 
      success: true, 
      message: `Seat ${seatNumber} allocated to ${student.name}`,
      data: {
        seatNumber: seat.seatNumber,
        roomNumber: seat.roomNumber,
        floor: seat.floor,
        studentName: student.name
      }
    });
    
  } catch (error) {
    console.error('Allocation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/seats/deallocate/:studentId
// @desc    Remove seat from a student (admin only)
// @access  Private (admin)
router.put('/deallocate/:studentId', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student || !student.seatNumber) {
      return res.status(404).json({ success: false, message: 'Student or seat not found' });
    }

    await Seat.findOneAndUpdate(
      { seatNumber: student.seatNumber },
      { isOccupied: false, occupiedBy: null, allocatedAt: null }
    );

    student.seatNumber = null;
    student.roomNumber = null;
    await student.save();

    res.json({ success: true, message: 'Seat deallocated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;