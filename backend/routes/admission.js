const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/admission/apply
// @desc    Student submits hall admission application
// @access  Private (student)
router.post('/apply', protect, authorize('student'), async (req, res) => {
  try {
    const { 
      studentId, department, session, phone, fatherName, motherName, permanentAddress,
      roll, dob, nid, bloodGroup, semester, cgpa, presentAddress, distanceFromHome,
      guardianName, guardianRelation, guardianPhone, guardianOccupation, quotas,
      bankName, branchName, accountNumber, receiptNumber, paymentDate
    } = req.body;

    // Check if already applied
    const existing = await Student.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted an admission application' 
      });
    }

    // Check if studentId already exists
    const existingStudentId = await Student.findOne({ studentId });
    if (existingStudentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'This Student ID has already been used for an application' 
      });
    }

    const student = await Student.create({
      userId: req.user._id,
      studentId,
      name: req.user.name,
      email: req.user.email,
      department,
      session,
      phone,
      fatherName,
      motherName,
      permanentAddress,
      // Additional fields
      roll,
      dob: dob ? new Date(dob) : undefined,
      nid,
      bloodGroup,
      semester,
      cgpa: cgpa ? parseFloat(cgpa) : undefined,
      presentAddress,
      distanceFromHome: distanceFromHome ? parseFloat(distanceFromHome) : undefined,
      guardianName,
      guardianRelation,
      guardianPhone,
      guardianOccupation,
      quotas: quotas || [],
      bankName: bankName || 'Sonali Bank',
      branchName,
      accountNumber,
      receiptNumber,
      paymentDate: paymentDate ? new Date(paymentDate) : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Admission application submitted successfully',
      data: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        department: student.department,
        status: student.admissionStatus,
        admissionDate: student.admissionDate
      }
    });
  } catch (error) {
    console.error('Admission application error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/admission/my-application
// @desc    Get own admission application status
// @access  Private (student)
router.get('/my-application', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'No application found' 
      });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/admission/all
// @desc    Get all applications (admin/staff only)
// @access  Private (admin, staff)
router.get('/all', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { status, department, session } = req.query;
    let filter = {};
    
    if (status) filter.admissionStatus = status;
    if (department) filter.department = department;
    if (session) filter.session = session;
    
    const students = await Student.find(filter)
      .sort({ admissionDate: -1 })
      .select('-__v');
    
    // Get statistics
    const stats = {
      total: await Student.countDocuments(),
      pending: await Student.countDocuments({ admissionStatus: 'pending' }),
      approved: await Student.countDocuments({ admissionStatus: 'approved' }),
      rejected: await Student.countDocuments({ admissionStatus: 'rejected' })
    };
    
    res.json({ 
      success: true, 
      count: students.length, 
      stats,
      data: students 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/admission/:id
// @desc    Get single application by ID (admin/staff only)
// @access  Private (admin, staff)
router.get('/:id', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'name email');
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   PUT /api/admission/:id/status
// @desc    Approve or reject an application (admin only)
// @access  Private (admin)
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, roomNumber, seatNumber, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status must be approved or rejected' 
      });
    }

    const updateData = { admissionStatus: status };
    
    if (status === 'approved') {
      if (roomNumber) updateData.roomNumber = roomNumber;
      if (seatNumber) updateData.seatNumber = seatNumber;
    }
    
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    res.json({ 
      success: true, 
      message: `Application ${status}`, 
      data: student 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   DELETE /api/admission/:id
// @desc    Delete an application (admin only)
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Application deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/admission/stats/dashboard
// @desc    Get admission statistics for dashboard
// @access  Private (admin, staff)
router.get('/stats/dashboard', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const total = await Student.countDocuments();
    const pending = await Student.countDocuments({ admissionStatus: 'pending' });
    const approved = await Student.countDocuments({ admissionStatus: 'approved' });
    const rejected = await Student.countDocuments({ admissionStatus: 'rejected' });
    
    // Get department-wise statistics
    const departmentStats = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        byDepartment: departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;