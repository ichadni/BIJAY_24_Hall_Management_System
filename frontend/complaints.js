// ==============================
// COMPLAINT SYSTEM - STUDENT SIDE
// ==============================

const API_BASE = "http://localhost:5500/api";

// Check authentication
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('user');
    
    if (!token || !currentUser) {
        alert('Please login to submit complaints');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const user = JSON.parse(currentUser);
        document.getElementById('userName').textContent = user.name || 'Student';
        document.getElementById('userInitial').textContent = (user.name || 'S').charAt(0).toUpperCase();
        
        // Load user's complaints
        await loadMyComplaints(token);
        
    } catch (error) {
        console.error('Error:', error);
    }
});

// Submit complaint
async function submitComplaint(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('user');
    
    if (!token || !currentUser) {
        alert('Please login to submit complaint');
        window.location.href = 'login.html';
        return;
    }
    
    const complaintData = {
        title: document.getElementById('complaintTitle').value.trim(),
        category: document.getElementById('complaintCategory').value,
        description: document.getElementById('complaintDescription').value.trim()
    };
    
    // Validate
    if (!complaintData.title || !complaintData.description || !complaintData.category) {
        alert('Please fill all required fields');
        return;
    }
    
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        console.log('Submitting complaint:', complaintData);
        
        const response = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(complaintData)
        });
        
        const result = await response.json();
        
        console.log('Complaint response:', result);
        
        if (result.success) {
            alert('✅ Complaint submitted successfully!\n\nOur team will review your complaint and respond soon.');
            
            // Reset form
            document.getElementById('complaintForm').reset();
            
            // Reload complaints list
            await loadMyComplaints(token);
        } else {
            alert(`❌ Submission failed: ${result.message}`);
        }
        
    } catch (error) {
        console.error('Error submitting complaint:', error);
        alert('Error submitting complaint. Please try again.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Load my complaints
async function loadMyComplaints(token) {
    const container = document.getElementById('complaintsList');
    
    if (!container) return;
    
    try {
        container.innerHTML = '<div class="empty-state">Loading your complaints...</div>';
        
        const response = await fetch(`${API_BASE}/complaints/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        console.log('Loaded complaints:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            container.innerHTML = result.data.map(complaint => {
                let statusClass = '';
                let statusText = '';
                
                switch(complaint.status) {
                    case 'pending':
                        statusClass = 'pending';
                        statusText = 'PENDING';
                        break;
                    case 'in_progress':
                        statusClass = 'in_progress';
                        statusText = 'IN PROGRESS';
                        break;
                    case 'resolved':
                        statusClass = 'resolved';
                        statusText = 'RESOLVED';
                        break;
                    case 'rejected':
                        statusClass = 'rejected';
                        statusText = 'REJECTED';
                        break;
                    default:
                        statusClass = 'pending';
                        statusText = complaint.status.toUpperCase();
                }
                
                return `
                    <div class="complaint-card ${statusClass}">
                        <div class="complaint-header">
                            <span class="complaint-title">${escapeHtml(complaint.title)}</span>
                            <span class="complaint-status status-${complaint.status}">${statusText}</span>
                        </div>
                        <div class="complaint-meta">
                            📅 ${new Date(complaint.createdAt).toLocaleString()} | 
                            📂 ${escapeHtml(complaint.category)}
                        </div>
                        <div class="complaint-description">
                            ${escapeHtml(complaint.description)}
                        </div>
                        ${complaint.adminNote ? `
                            <div class="admin-note">
                                <strong>📝 Staff Response:</strong><br>
                                ${escapeHtml(complaint.adminNote)}
                                ${complaint.resolvedAt ? `<br><small>Resolved on: ${new Date(complaint.resolvedAt).toLocaleString()}</small>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<div class="empty-state">📭 No complaints submitted yet.<br>Use the form above to submit your first complaint.</div>';
        }
        
    } catch (error) {
        console.error('Error loading complaints:', error);
        container.innerHTML = '<div class="empty-state">⚠️ Error loading complaints. Please refresh the page.</div>';
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// Make functions global
window.logout = logout;
window.submitComplaint = submitComplaint;

// Attach event listeners
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', submitComplaint);
    }
});