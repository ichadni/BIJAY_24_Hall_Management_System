// ==============================
// STAFF DASHBOARD - COMPLETE WORKING VERSION WITH COMPLAINTS
// ==============================

const API_BASE = "http://localhost:5500/api";

let currentApplication = null;
let currentFilter = 'all';
let applicationsData = [];
let currentComplaint = null;
let currentComplaintFilter = 'all';

// Check if staff is logged in
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('user');
    
    if (!token || !currentUser) {
        alert('Please login to access staff dashboard!');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const user = JSON.parse(currentUser);
        
        const staffRoles = ['admin', 'staff', 'hall-admin'];
        if (!staffRoles.includes(user.role)) {
            alert('Access denied! This area is for staff only.');
            window.location.href = 'dashboard.html';
            return;
        }
        
        document.getElementById('staffName').textContent = user.name;
        document.getElementById('staffRole').textContent = getRoleDisplayName(user.role);
        
        await loadDashboardData();
        await loadApplications();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        window.location.href = 'login.html';
    }
});

function getRoleDisplayName(role) {
    const roles = {
        'admin': 'Administrator',
        'staff': 'Staff Member',
        'hall-admin': 'Hall Administrator'
    };
    return roles[role] || role;
}

async function loadDashboardData() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE}/admission/stats/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data;
            document.getElementById('pendingApplications').textContent = stats.pending || 0;
            document.getElementById('approvedApplications').textContent = stats.approved || 0;
            document.getElementById('occupiedRooms').textContent = Math.ceil((stats.approved || 0) / 4);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadApplications() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('applicationsTableBody');
    if (!tbody) return;
    
    try {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Loading applications...<\/td><\/tr>';
        
        let url = `${API_BASE}/admission/all`;
        if (currentFilter !== 'all') url += `?status=${currentFilter}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
            applicationsData = result.data;
            
            if (applicationsData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="no-data">No applications found<\/td><\/tr>';
                return;
            }
            
            tbody.innerHTML = applicationsData.map(app => `
                <tr>
                    <td>${app._id.slice(-8)}<\/td>
                    <td>${app.name || 'N/A'}<\/td>
                    <td>${app.studentId || 'N/A'}<\/td>
                    <td>${app.department || 'N/A'}<\/td>
                    <td>${app.cgpa || 'N/A'}<\/td>
                    <td>${app.quotas ? app.quotas.join(', ') : 'General'}<\/td>
                    <td><span class="status-badge status-${app.admissionStatus}">${app.admissionStatus}<\/span><\/td>
                    <td><button class="btn-small btn-info" onclick='viewApplication("${app._id}")'>View<\/button><\/td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Error loading applications<\/td><\/tr>';
    }
}

function filterApplications(filter) {
    currentFilter = filter;
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === filter || (filter === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });
    loadApplications();
}

async function viewApplication(applicationId) {
    const token = localStorage.getItem('token');
    const modal = document.getElementById('applicationModal');
    const details = document.getElementById('applicationDetails');
    
    if (!modal || !details) return;
    
    try {
        const response = await fetch(`${API_BASE}/admission/${applicationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const app = result.data;
            currentApplication = app;
            
            details.innerHTML = `
                <div class="application-detail-grid">
                    <div class="detail-section">
                        <h3>Personal Information</h3>
                        <p><strong>Name:</strong> ${app.name || 'N/A'}</p>
                        <p><strong>Father's Name:</strong> ${app.fatherName || 'N/A'}</p>
                        <p><strong>Mother's Name:</strong> ${app.motherName || 'N/A'}</p>
                        <p><strong>Date of Birth:</strong> ${app.dob ? new Date(app.dob).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Blood Group:</strong> ${app.bloodGroup || 'N/A'}</p>
                        <p><strong>NID:</strong> ${app.nid || 'N/A'}</p>
                    </div>
                    <div class="detail-section">
                        <h3>Academic Information</h3>
                        <p><strong>Student ID:</strong> ${app.studentId || 'N/A'}</p>
                        <p><strong>Roll:</strong> ${app.roll || 'N/A'}</p>
                        <p><strong>Department:</strong> ${app.department || 'N/A'}</p>
                        <p><strong>Session:</strong> ${app.session || 'N/A'}</p>
                        <p><strong>Semester:</strong> ${app.semester || 'N/A'}</p>
                        <p><strong>CGPA:</strong> ${app.cgpa || 'N/A'}</p>
                    </div>
                    <div class="detail-section">
                        <h3>Contact Information</h3>
                        <p><strong>Phone:</strong> ${app.phone || 'N/A'}</p>
                        <p><strong>Email:</strong> ${app.email || 'N/A'}</p>
                        <p><strong>Present Address:</strong> ${app.presentAddress || 'N/A'}</p>
                        <p><strong>Permanent Address:</strong> ${app.permanentAddress || 'N/A'}</p>
                    </div>
                    <div class="detail-section">
                        <h3>Application Details</h3>
                        <p><strong>Status:</strong> <span class="status-badge status-${app.admissionStatus}">${app.admissionStatus}<\/span></p>
                        <p><strong>Date:</strong> ${new Date(app.admissionDate).toLocaleDateString()}</p>
                        ${app.roomNumber ? `<p><strong>Room:</strong> ${app.roomNumber}</p>` : ''}
                        ${app.seatNumber ? `<p><strong>Seat:</strong> ${app.seatNumber}</p>` : ''}
                    </div>
                </div>
            `;
            modal.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading application details');
    }
}

// ============================================
// APPROVE APPLICATION & ALLOCATE SEAT
// ============================================
async function approveApplication() {
    if (!currentApplication) {
        alert('No application selected!');
        return;
    }
    
    const token = localStorage.getItem('token');
    const studentId = currentApplication._id;
    
    try {
        console.log('Updating status to approved...');
        const statusResponse = await fetch(`${API_BASE}/admission/${studentId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'approved' })
        });
        
        const statusResult = await statusResponse.json();
        
        if (!statusResult.success) {
            alert(`Failed to approve: ${statusResult.message}`);
            return;
        }
        
        console.log('✅ Application approved!');
        
        const seatsResponse = await fetch(`${API_BASE}/seats/available`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const seatsResult = await seatsResponse.json();
        
        if (!seatsResult.success || seatsResult.data.length === 0) {
            alert('✅ Application approved!\n\nNo available seats! Please seed seats first.');
            closeModal();
            await refreshAllData();
            return;
        }
        
        const availableSeats = seatsResult.data;
        let seatList = '📋 Available Seats:\n\n';
        availableSeats.forEach((seat, index) => {
            seatList += `${index + 1}. Room: ${seat.roomNumber}, Seat: ${seat.seatNumber}\n`;
        });
        seatList += '\nEnter seat number:';
        
        const selectedSeat = prompt(seatList, availableSeats[0]?.seatNumber);
        
        if (!selectedSeat) {
            alert('Application approved but seat allocation skipped.');
            closeModal();
            await refreshAllData();
            return;
        }
        
        const allocateResponse = await fetch(`${API_BASE}/seats/allocate/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ seatNumber: selectedSeat })
        });
        
        const allocateResult = await allocateResponse.json();
        
        if (allocateResult.success) {
            alert(`✅ Application approved and seat allocated!\n\nSeat: ${selectedSeat}`);
        } else {
            alert(`⚠️ Application approved but seat allocation failed: ${allocateResult.message}`);
        }
        
        closeModal();
        await refreshAllData();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

async function rejectApplication() {
    if (!currentApplication) return;
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE}/admission/${currentApplication._id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'rejected' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`❌ Application rejected.\nReason: ${reason}`);
            closeModal();
            await refreshAllData();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error rejecting application');
    }
}

// ============================================
// REFRESH ALL DATA
// ============================================
async function refreshAllData() {
    await loadApplications();
    await loadDashboardData();
    await loadRoomAllocations();
    console.log('✅ All data refreshed');
}

// ============================================
// SEED SEATS
// ============================================
async function seedSeats() {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('user');
    const user = JSON.parse(currentUser);
    
    if (user.role !== 'admin') {
        alert('Only administrators can seed seats!');
        return;
    }
    
    const floors = prompt('Number of floors (default: 5):', '5');
    const roomsPerFloor = prompt('Rooms per floor (default: 10):', '10');
    const seatsPerRoom = prompt('Seats per room (default: 4):', '4');
    
    if (!floors || !roomsPerFloor || !seatsPerRoom) return;
    
    try {
        const response = await fetch(`${API_BASE}/seats/seed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                floors: parseInt(floors),
                roomsPerFloor: parseInt(roomsPerFloor),
                seatsPerRoom: parseInt(seatsPerRoom)
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ ${result.message}`);
            await refreshAllData();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error seeding seats');
    }
}

// ============================================
// SECTION NAVIGATION
// ============================================
function showApplications() {
    hideAllSections();
    document.getElementById('applicationsSection').style.display = 'block';
    loadApplications();
}

function showSeatManagement() {
    hideAllSections();
    document.getElementById('seatAllocationSection').style.display = 'block';
    loadRoomAllocations();
}

function showComplaints() {
    hideAllSections();
    document.getElementById('complaintsSection').style.display = 'block';
    loadComplaintsForStaff();
}

function showDiningManagement() { alert('Coming soon!'); }
function showStaffManagement() { alert('Coming soon!'); }
function showNotices() { alert('Coming soon!'); }

function hideAllSections() {
    const sections = ['applicationsSection', 'seatAllocationSection', 'complaintsSection'];
    sections.forEach(section => {
        const el = document.getElementById(section);
        if (el) el.style.display = 'none';
    });
}

// ============================================
// ROOM ALLOCATIONS
// ============================================
async function loadRoomAllocations() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('roomAllocationTableBody');
    if (!tbody) return;
    
    try {
        const response = await fetch(`${API_BASE}/seats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const occupiedSeats = result.data.filter(seat => seat.isOccupied);
            
            if (occupiedSeats.length === 0) {
                tbody.innerHTML = '<td><td colspan="7" class="no-data">No allocations found<\/td><\/tr>';
                return;
            }
            
            const rooms = {};
            occupiedSeats.forEach(seat => {
                if (!rooms[seat.roomNumber]) {
                    rooms[seat.roomNumber] = {
                        roomNo: seat.roomNumber,
                        floor: seat.floor || 'N/A',
                        beds: {}
                    };
                }
                const bedNum = seat.seatNumber.split('-S')[1] || '1';
                rooms[seat.roomNumber].beds[bedNum] = seat.occupiedBy?.name || 'Student';
            });
            
            tbody.innerHTML = Object.values(rooms).map(room => `
                <tr>
                    <td>${room.roomNo}<\/td>
                    <td>${room.floor}<\/td>
                    <td>${room.beds['1'] || '-'}<\/td>
                    <td>${room.beds['2'] || '-'}<\/td>
                    <td>${room.beds['3'] || '-'}<\/td>
                    <td>${room.beds['4'] || '-'}<\/td>
                    <td>${Object.keys(room.beds).length}/4<\/td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Error loading allocations<\/td><\/tr>';
    }
}

// ============================================
// COMPLAINT MANAGEMENT - FIXED VERSION
// ============================================
async function loadComplaintsForStaff() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('complaintsTableBody');
    
    if (!tbody) return;
    
    try {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Loading complaints...<\/td><\/tr>';
        
        // Fetch complaints
        const response = await fetch(`${API_BASE}/complaints`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        console.log('Complaints API Response:', result);
        
        // Fetch students to get names
        const studentsRes = await fetch(`${API_BASE}/admission/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const studentsResult = await studentsRes.json();
        const students = studentsResult.data || [];
        
        // Create a map of student IDs to student data
        const studentMap = {};
        students.forEach(s => {
            studentMap[s._id] = s;
        });
        
        if (result.data && result.data.length > 0) {
            tbody.innerHTML = result.data.map(complaint => {
                let studentName = 'Unknown';
                let roomNumber = 'N/A';
                
                const studentId = complaint.studentId;
                if (studentId) {
                    if (typeof studentId === 'object' && studentId.name) {
                        studentName = studentId.name;
                        roomNumber = studentId.roomNumber || 'N/A';
                    } else if (studentMap[studentId]) {
                        studentName = studentMap[studentId].name || 'Unknown';
                        roomNumber = studentMap[studentId].roomNumber || 'N/A';
                    }
                }
                
                return `
                    <tr>
                        <td>${complaint._id.slice(-8)}<\/td>
                        <td>${studentName}<\/td>
                        <td>${roomNumber}<\/td>
                        <td>${complaint.category || 'N/A'}<\/td>
                        <td>${complaint.title ? complaint.title.substring(0, 40) : 'N/A'}${complaint.title && complaint.title.length > 40 ? '...' : ''}<\/td>
                        <td>${new Date(complaint.createdAt).toLocaleDateString()}<\/td>
                        <td><span class="status-badge status-${complaint.status}">${complaint.status.toUpperCase()}<\/span><\/td>
                        <td>
                            <button class="btn-small btn-info" onclick="viewComplaintDetails('${complaint._id}')">View<\/button>
                        <\/td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="8" class="no-data">No complaints found<\/td><\/tr>';
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Error loading complaints: ' + error.message + '<\/td><\/tr>';
    }
}

function filterComplaints(filter) {
    currentComplaintFilter = filter;
    const buttons = document.querySelectorAll('#complaintsSection .filter-btn');
    if (buttons.length > 0) {
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === filter || (filter === 'all' && btn.textContent === 'All')) {
                btn.classList.add('active');
            }
        });
    }
    loadComplaintsForStaff();
}

async function viewComplaintDetails(complaintId) {
    const token = localStorage.getItem('token');
    
    try {
        // Get complaints
        const response = await fetch(`${API_BASE}/complaints`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        const complaint = result.data.find(c => c._id === complaintId);
        
        // Get students for mapping
        const studentsRes = await fetch(`${API_BASE}/admission/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const studentsResult = await studentsRes.json();
        const students = studentsResult.data || [];
        const studentMap = {};
        students.forEach(s => {
            studentMap[s._id] = s;
        });
        
        if (complaint) {
            currentComplaint = complaint;
            
            let studentName = 'Unknown';
            let studentIdNum = 'N/A';
            let roomNumber = 'N/A';
            
            const studId = complaint.studentId;
            if (studId) {
                if (typeof studId === 'object' && studId.name) {
                    studentName = studId.name;
                    studentIdNum = studId.studentId || 'N/A';
                    roomNumber = studId.roomNumber || 'N/A';
                } else if (studentMap[studId]) {
                    studentName = studentMap[studId].name;
                    studentIdNum = studentMap[studId].studentId;
                    roomNumber = studentMap[studId].roomNumber || 'N/A';
                }
            }
            
            let modal = document.getElementById('complaintModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'complaintModal';
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close" onclick="closeComplaintModal()">&times;</span>
                        <h2>Complaint Details</h2>
                        <div id="complaintDetails"></div>
                        <div class="modal-actions">
                            <button class="btn btn-warning" onclick="updateComplaintStatus('in_progress')">🔄 In Progress</button>
                            <button class="btn btn-success" onclick="updateComplaintStatus('resolved')">✓ Resolve</button>
                            <button class="btn btn-danger" onclick="updateComplaintStatus('rejected')">✗ Reject</button>
                            <button class="btn btn-secondary" onclick="closeComplaintModal()">Close</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }
            
            const detailsDiv = document.getElementById('complaintDetails');
            detailsDiv.innerHTML = `
                <div class="complaint-detail">
                    <p><strong>Student Name:</strong> ${studentName}</p>
                    <p><strong>Student ID:</strong> ${studentIdNum}</p>
                    <p><strong>Room Number:</strong> ${roomNumber}</p>
                    <p><strong>Category:</strong> ${complaint.category}</p>
                    <p><strong>Title:</strong> ${complaint.title}</p>
                    <p><strong>Description:</strong></p>
                    <p style="background:#f3f4f6; padding:10px; border-radius:8px;">${complaint.description}</p>
                    <p><strong>Submitted:</strong> ${new Date(complaint.createdAt).toLocaleString()}</p>
                    <p><strong>Current Status:</strong> <span class="status-badge status-${complaint.status}">${complaint.status}</span></p>
                    ${complaint.adminNote ? `<p><strong>Admin Note:</strong> ${complaint.adminNote}</p>` : ''}
                    <div class="form-group" style="margin-top:15px;">
                        <label><strong>Admin Response/Note:</strong></label>
                        <textarea id="adminNoteInput" rows="3" style="width:100%; padding:8px; border-radius:8px; border:1px solid #e5e7eb;">${complaint.adminNote || ''}</textarea>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading complaint details: ' + error.message);
    }
}

async function updateComplaintStatus(status) {
    if (!currentComplaint) return;
    
    const adminNote = document.getElementById('adminNoteInput')?.value || '';
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE}/complaints/${currentComplaint._id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, adminNote })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Complaint ${status.replace('_', ' ')} successfully!`);
            closeComplaintModal();
            await loadComplaintsForStaff();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating complaint status');
    }
}

function closeComplaintModal() {
    const modal = document.getElementById('complaintModal');
    if (modal) modal.style.display = 'none';
    currentComplaint = null;
}
async function fixComplaints() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user.role !== 'admin') {
        alert('Only administrators can fix complaints!');
        return;
    }
    
    if (!confirm('This will fix all complaint references. Continue?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/complaints/fix-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ ${result.message}`);
            location.reload();
        } else {
            alert(`❌ Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fixing complaints: ' + error.message);
    }
}

window.fixComplaints = fixComplaints;

// ============================================
// SEAT ALLOCATION
// ============================================
async function allocateSeat(event) {
    event.preventDefault();
    
    const studentRegNo = document.getElementById('allocateStudentReg').value;
    const roomNumber = document.getElementById('allocateRoomNo').value;
    const bedNumber = document.getElementById('allocateBedNo').value;
    const floor = document.getElementById('allocateFloor').value;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE}/admission/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
            const student = result.data.find(s => s.studentId === studentRegNo);
            if (!student) { alert('Student not found!'); return; }
            
            if (student.admissionStatus !== 'approved') {
                alert('Student application must be approved first!');
                return;
            }
            
            const seatNumber = `${roomNumber}-S${bedNumber}`;
            
            const allocateResponse = await fetch(`${API_BASE}/seats/allocate/${student._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ seatNumber: seatNumber })
            });
            
            const allocateResult = await allocateResponse.json();
            
            if (allocateResult.success) {
                alert(`✅ Seat allocated!\nRoom: ${roomNumber}, Bed: ${bedNumber}, Floor: ${floor}`);
                event.target.reset();
                await refreshAllData();
            } else {
                alert(`Error: ${allocateResult.message}`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error allocating seat');
    }
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function closeModal() {
    const modal = document.getElementById('applicationModal');
    if (modal) {
        modal.style.display = 'none';
        currentApplication = null;
    }
}

function staffLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('applicationModal');
    if (event.target === modal) closeModal();
    const complaintModal = document.getElementById('complaintModal');
    if (event.target === complaintModal) closeComplaintModal();
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
window.showApplications = showApplications;
window.showSeatManagement = showSeatManagement;
window.showComplaints = showComplaints;
window.showDiningManagement = showDiningManagement;
window.showStaffManagement = showStaffManagement;
window.showNotices = showNotices;
window.filterApplications = filterApplications;
window.filterComplaints = filterComplaints;
window.allocateSeat = allocateSeat;
window.closeModal = closeModal;
window.approveApplication = approveApplication;
window.rejectApplication = rejectApplication;
window.staffLogout = staffLogout;
window.viewApplication = viewApplication;
window.seedSeats = seedSeats;
window.viewComplaintDetails = viewComplaintDetails;
window.updateComplaintStatus = updateComplaintStatus;
window.closeComplaintModal = closeComplaintModal;