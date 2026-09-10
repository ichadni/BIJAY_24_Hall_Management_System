// ==============================
// STUDENT DASHBOARD - COMPLETE WORKING VERSION
// ==============================

const API_BASE = "http://localhost:5500/api";

window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('user');
    
    if (!token || !currentUser) {
        alert('Please login to access dashboard');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const user = JSON.parse(currentUser);
        document.getElementById('userName').textContent = user.name || 'Student';
        document.getElementById('userInitial').textContent = (user.name || 'S').charAt(0).toUpperCase();
        
        await loadApplicationStatus(token);
        
        // Auto-refresh every 10 seconds to check for status updates
        setInterval(() => loadApplicationStatus(token), 10000);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
});

async function loadApplicationStatus(token) {
    const statusElement = document.getElementById('applicationStatus');
    const roomElement = document.getElementById('roomNumber');
    const feeElement = document.getElementById('feeStatus');
    const hallCardElement = document.getElementById('hallCard');
    
    try {
        const response = await fetch(`${API_BASE}/admission/my-application`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            const student = result.data;
            const status = student.admissionStatus;
            
            if (status === 'approved') {
                statusElement.innerHTML = '✅ <strong>Approved!</strong><br>Your application has been approved.';
                statusElement.style.color = '#065f46';
                
                if (student.roomNumber && student.seatNumber) {
                    roomElement.innerHTML = `
                        <strong>🏠 Room:</strong> ${student.roomNumber}<br>
                        <strong>🪑 Seat:</strong> ${student.seatNumber}<br>
                        ${student.floor ? `<strong>📊 Floor:</strong> ${student.floor}<br>` : ''}
                        <span style="color: #10b981;">✓ Seat allocated</span>
                    `;
                } else {
                    roomElement.innerHTML = '⏳ Seat allocation in progress...';
                }
                roomElement.style.color = '#065f46';
                
                feeElement.innerHTML = '✅ Paid<br>Admission fee confirmed';
                hallCardElement.innerHTML = '📇 Available for collection<br>Visit hall office';
                
            } else if (status === 'rejected') {
                statusElement.innerHTML = '❌ <strong>Rejected</strong><br>Your application has been rejected.';
                statusElement.style.color = '#991b1b';
                roomElement.innerHTML = 'Not Allocated';
                feeElement.innerHTML = 'Contact Hall Office';
                hallCardElement.innerHTML = 'Not Issued';
            } else {
                statusElement.innerHTML = '⏳ <strong>Under Review</strong><br>Your application is being processed.';
                statusElement.style.color = '#92400e';
                roomElement.innerHTML = 'Awaiting approval';
                feeElement.innerHTML = 'Under Verification';
                hallCardElement.innerHTML = 'Will be issued after approval';
            }
        } else {
            statusElement.innerHTML = '📝 <strong>Not Applied</strong><br><a href="admission.html" class="apply-link">Apply Now</a>';
            statusElement.style.color = '#6b7280';
            roomElement.innerHTML = 'Not Applied';
            feeElement.innerHTML = 'N/A';
            hallCardElement.innerHTML = 'N/A';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

window.logout = logout;
document.getElementById('logoutBtn')?.addEventListener('click', logout);