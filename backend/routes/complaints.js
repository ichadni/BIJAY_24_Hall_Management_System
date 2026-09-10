const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/complaints
// @desc    Submit a complaint (student)
// @access  Private (student)
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { title, description, category } = req.body;

    // Find student by userId
    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(400).json({ 
        success: false, 
        message: 'You need to complete admission first' 
      });
    }

    const complaint = await Complaint.create({
      studentId: student._id,
      title,
      description,
      category,
      status: 'pending'
    });

    res.status(201).json({ 
      success: true, 
      message: 'Complaint submitted successfully', 
      data: complaint 
    });
  } catch (error) {
    console.error('Complaint submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/complaints/my
// @desc    Get own complaints (student)
// @access  Private (student)
router.get('/my', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.json({ success: true, data: [] });
    }

    const complaints = await Complaint.find({ studentId: student._id })
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: complaints });
  } catch (error) {
    console.error('Error loading complaints:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/complaints
// @desc    Get all complaints (admin/staff)
// @access  Private (admin, staff)
router.get('/', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Get complaints and populate student data
    const complaints = await Complaint.find(filter)
      .populate('studentId', 'name studentId roomNumber')
      .sort({ createdAt: -1 });

    // Format the response
    const formattedData = complaints.map(complaint => {
      const obj = complaint.toObject();
      // If studentId is null or undefined, provide default
      if (!obj.studentId) {
        obj.studentId = {
          name: 'Unknown Student',
          studentId: 'N/A',
          roomNumber: 'N/A'
        };
      }
      return obj;
    });

    res.json({ 
      success: true, 
      count: formattedData.length, 
      data: formattedData 
    });
  } catch (error) {
    console.error('Error loading complaints:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/complaints/:id/status
// @desc    Update complaint status (admin/staff)
// @access  Private (admin, staff)
router.put('/:id/status', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const update = { status, adminNote };
    if (status === 'resolved') update.resolvedAt = new Date();

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('studentId', 'name studentId roomNumber');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, message: 'Complaint updated', data: complaint });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/complaints/:id
// @desc    Delete a complaint (admin only)
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// FIX ENDPOINT - Add this at the bottom
// ============================================
router.post('/fix-all', protect, authorize('admin'), async (req, res) => {
  try {
    // Get first student as default
    const defaultStudent = await Student.findOne();
    if (!defaultStudent) {
      return res.status(400).json({ success: false, message: 'No student found in database' });
    }

    // Update all complaints to use this student
    const result = await Complaint.updateMany(
      {},
      { $set: { studentId: defaultStudent._id } }
    );

    res.json({ 
      success: true, 
      message: `Fixed ${result.modifiedCount} complaints`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Fix error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;