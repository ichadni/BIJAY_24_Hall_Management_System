const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Complaint = require('../models/Complaint');
const Seat = require('../models/Seat');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/dashboard/admin
// @desc    Admin dashboard summary
// @access  Private (admin)
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalStudents,
      pendingApplications,
      approvedStudents,
      totalSeats,
      occupiedSeats,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ admissionStatus: 'pending' }),
      Student.countDocuments({ admissionStatus: 'approved' }),
      Seat.countDocuments(),
      Seat.countDocuments({ isOccupied: true }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'resolved' })
    ]);

    const recentApplications = await Student.find({ admissionStatus: 'pending' })
      .sort({ admissionDate: -1 })
      .limit(5);

    const recentComplaints = await Complaint.find({ status: 'pending' })
      .populate('studentId', 'name studentId')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          pendingApplications,
          approvedStudents,
          totalSeats,
          occupiedSeats,
          availableSeats: totalSeats - occupiedSeats,
          totalComplaints,
          pendingComplaints,
          resolvedComplaints
        },
        recentApplications,
        recentComplaints
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/dashboard/staff
// @desc    Staff dashboard summary
// @access  Private (staff)
router.get('/staff', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const [totalStudents, pendingComplaints, availableSeats] = await Promise.all([
      Student.countDocuments({ admissionStatus: 'approved' }),
      Complaint.countDocuments({ status: 'pending' }),
      Seat.countDocuments({ isOccupied: false })
    ]);

    const recentComplaints = await Complaint.find()
      .populate('studentId', 'name studentId roomNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: { stats: { totalStudents, pendingComplaints, availableSeats }, recentComplaints }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/dashboard/student
// @desc    Student dashboard — own data
// @access  Private (student)
router.get('/student', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return res.json({
        success: true,
        data: { student: null, complaints: [], message: 'No admission application found' }
      });
    }

    const complaints = await Complaint.find({ studentId: student._id }).sort({ createdAt: -1 });

    let seatInfo = null;
    if (student.seatNumber) {
      seatInfo = await Seat.findOne({ seatNumber: student.seatNumber });
    }

    res.json({
      success: true,
      data: { student, complaints, seatInfo }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;