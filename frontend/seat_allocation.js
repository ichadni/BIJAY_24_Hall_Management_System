// ==============================
// SEAT ALLOCATION - BACKEND INTEGRATION
// ==============================

const API_BASE = "http://localhost:5500/api";

// Global variables
let currentStudent = null;
let currentSeat = null;
let roommates = [];

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('user');
    
    if (!token || !currentUser) {
        alert('Please login to access seat allocation page');
        localStorage.setItem('redirectAfterLogin', 'seat-allocation.html');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const user = JSON.parse(currentUser);
        
        // Check if user is a student
        if (user.role !== 'student') {
            alert('This page is only for students.');
            window.location.href = 'staff-dashboard.html';
            return;
        }
        
        // Store current student info
        currentStudent = user;
        
        // Display student info
        document.getElementById('studentNameDisplay').textContent = user.name || 'Student';
        document.getElementById('studentRegDisplay').textContent = user.studentId || 'Not available';
        document.getElementById('studentDeptDisplay').textContent = user.department || 'Not available';
        
        // Load seat allocation
        await loadSeatAllocation(token);
        
    } catch (error) {
        console.error('Error loading page:', error);
        window.location.href = 'login.html';
    }
});

// Load seat allocation from backend
async function loadSeatAllocation(token) {
    const statusCard = document.getElementById('allocationStatus');
    const roomDetailsCard = document.getElementById('roomDetailsCard');
    const notAllocatedCard = document.getElementById('notAllocatedCard');
    
    try {
        // First, check if student has approved admission
        const applicationResponse = await fetch(`${API_BASE}/admission/my-application`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const applicationResult = await applicationResponse.json();
        
        if (!applicationResult.success || !applicationResult.data) {
            // No application found
            statusCard.style.display = 'none';
            notAllocatedCard.style.display = 'block';
            return;
        }
        
        const student = applicationResult.data;
        const admissionStatus = student.admissionStatus;
        
        if (admissionStatus !== 'approved') {
            // Application not approved yet
            statusCard.style.display = 'none';
            notAllocatedCard.style.display = 'block';
            
            // Update not allocated card with specific message
            const notAllocatedCardDiv = document.getElementById('notAllocatedCard');
            if (notAllocatedCardDiv) {
                const nextStepsDiv = notAllocatedCardDiv.querySelector('.next-steps');
                if (nextStepsDiv) {
                    if (admissionStatus === 'pending') {
                        nextStepsDiv.innerHTML = `
                            <h3>Next Steps:</h3>
                            <ol>
                                <li>✅ Your admission application has been submitted</li>
                                <li>⏳ Waiting for provost approval</li>
                                <li>⏳ Once approved, hall office will allocate your seat</li>
                                <li>📧 You will receive a notification</li>
                            </ol>
                        `;
                    } else if (admissionStatus === 'rejected') {
                        nextStepsDiv.innerHTML = `
                            <h3>Application Status:</h3>
                            <ol>
                                <li>❌ Your admission application has been rejected</li>
                                <li>📞 Please contact the hall office for more information</li>
                                <li>📝 You may reapply in the next session</li>
                            </ol>
                        `;
                    }
                }
            }
            return;
        }
        
        // Application is approved, get seat allocation
        const seatsResponse = await fetch(`${API_BASE}/seats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const seatsResult = await seatsResponse.json();
        
        if (seatsResult.success) {
            // Find seat allocated to this student
            const mySeat = seatsResult.data.find(seat => seat.occupiedBy === student._id);
            
            if (mySeat) {
                currentSeat = mySeat;
                // Display seat details
                displaySeatDetails(mySeat, student);
                
                // Find roommates
                await findRoommates(token, mySeat.roomNumber, student._id);
                
                // Hide status card and show room details
                statusCard.style.display = 'none';
                roomDetailsCard.style.display = 'block';
            } else {
                // Approved but no seat allocated yet
                statusCard.style.display = 'none';
                notAllocatedCard.style.display = 'block';
                
                const notAllocatedCardDiv = document.getElementById('notAllocatedCard');
                if (notAllocatedCardDiv) {
                    const nextStepsDiv = notAllocatedCardDiv.querySelector('.next-steps');
                    if (nextStepsDiv) {
                        nextStepsDiv.innerHTML = `
                            <h3>Next Steps:</h3>
                            <ol>
                                <li>✅ Your application has been approved!</li>
                                <li>⏳ Seat allocation in progress</li>
                                <li>📞 Please contact the hall office for your seat assignment</li>
                                <li>📧 You will receive a notification once seat is allocated</li>
                            </ol>
                        `;
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('Error loading seat allocation:', error);
        statusCard.innerHTML = `
            <div class="status-icon">⚠️</div>
            <h2>Error Loading Data</h2>
            <p>Unable to fetch seat allocation details. Please try again later.</p>
        `;
    }
}

// Display seat details
function displaySeatDetails(seat, student) {
    // Set room number
    const roomElement = document.getElementById('allocatedRoom');
    if (roomElement) roomElement.textContent = seat.roomNumber || 'N/A';
    
    // Set floor
    const floorElement = document.getElementById('allocatedFloor');
    if (floorElement) floorElement.textContent = seat.floor || 'N/A';
    
    // Set bed number (extract from seatNumber)
    let bedNumber = 'N/A';
    if (seat.seatNumber) {
        const match = seat.seatNumber.match(/-S(\d+)/);
        if (match) bedNumber = match[1];
    }
    const bedElement = document.getElementById('allocatedBed');
    if (bedElement) bedElement.textContent = bedNumber;
    
    // Set allocation date
    const dateElement = document.getElementById('allocationDate');
    if (dateElement && seat.allocatedAt) {
        dateElement.textContent = new Date(seat.allocatedAt).toLocaleDateString();
    } else if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString();
    }
}

// Find roommates
async function findRoommates(token, roomNumber, currentStudentId) {
    const roommatesGrid = document.getElementById('roommatesList');
    
    try {
        const response = await fetch(`${API_BASE}/seats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Find all seats in the same room that are occupied
            const roomSeats = result.data.filter(seat => 
                seat.roomNumber === roomNumber && 
                seat.isOccupied === true &&
                seat.occupiedBy !== currentStudentId
            );
            
            if (roomSeats.length > 0) {
                // Get roommate details
                const roommatePromises = roomSeats.map(async (seat) => {
                    if (seat.occupiedBy && typeof seat.occupiedBy === 'object') {
                        return seat.occupiedBy;
                    } else if (seat.occupiedBy) {
                        const studentResponse = await fetch(`${API_BASE}/admission/all`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const studentResult = await studentResponse.json();
                        if (studentResult.success) {
                            return studentResult.data.find(s => s._id === seat.occupiedBy);
                        }
                    }
                    return null;
                });
                
                const roommatesData = await Promise.all(roommatePromises);
                const validRoommates = roommatesData.filter(r => r !== null);
                
                if (validRoommates.length > 0) {
                    roommatesGrid.innerHTML = validRoommates.map(roommate => `
                        <div class="roommate-card">
                            <div class="roommate-icon">👤</div>
                            <div class="roommate-info">
                                <h4>${roommate.name || 'Student'}</h4>
                                <p>${roommate.department || 'N/A'}</p>
                                <small>Session: ${roommate.session || 'N/A'}</small>
                            </div>
                        </div>
                    `).join('');
                } else {
                    roommatesGrid.innerHTML = '<p class="text-muted">No roommates assigned yet.</p>';
                }
            } else {
                roommatesGrid.innerHTML = '<p class="text-muted">No roommates assigned yet. You may be the first occupant of this room.</p>';
            }
        }
    } catch (error) {
        console.error('Error loading roommates:', error);
        roommatesGrid.innerHTML = '<p class="text-muted">Unable to load roommate information.</p>';
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = 'index.html';
    }
}

// Make logout available globally
window.logout = logout;