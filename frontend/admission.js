// ==============================
// ADMISSION APPLICATION - BACKEND API VERSION
// ==============================

const API_BASE = "http://localhost:5500/api";

// Check if user is logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('user');
    
    if (!token || !currentUser) {
        alert('Please login first to apply for admission!');
        localStorage.setItem('redirectAfterLogin', 'admission.html');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const user = JSON.parse(currentUser);
        
        // Verify user is a student
        if (user.role !== 'student') {
            alert('Only students can apply for admission. Staff members use the staff dashboard.');
            window.location.href = 'staff-dashboard.html';
            return;
        }
        
        // Check if student already has an application
        checkExistingApplication(token);
        
        // Pre-fill form with user data
        prefillUserData(user);
        
        // Load saved draft if exists
        loadDraft(user);
        
        // Set up auto-save
        setupAutoSave(user);
        
    } catch (e) {
        console.error('Error parsing user data:', e);
        window.location.href = 'login.html';
    }
});

// Check if student already applied
async function checkExistingApplication(token) {
    try {
        const response = await fetch(`${API_BASE}/admission/my-application`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            const application = result.data;
            const status = application.admissionStatus || 'pending';
            
            let message = `You have already submitted an admission application.\n\n`;
            message += `Application ID: ${application._id.slice(-8)}\n`;
            message += `Status: ${status.toUpperCase()}\n`;
            message += `Submission Date: ${new Date(application.admissionDate).toLocaleDateString()}\n\n`;
            
            if (status === 'approved') {
                message += `✅ Your application has been APPROVED!\n`;
                if (application.roomNumber) {
                    message += `Room: ${application.roomNumber}\n`;
                    message += `Seat: ${application.seatNumber || 'Not assigned'}\n\n`;
                }
                message += `You will be redirected to your dashboard.`;
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 3000);
            } else if (status === 'rejected') {
                message += `❌ Your application has been REJECTED.\nPlease contact the hall office for more information.`;
            } else {
                message += `⏳ Your application is under review.\nYou will be notified once a decision is made.`;
            }
            
            alert(message);
            
            if (status !== 'rejected') {
                disableForm();
            }
        }
    } catch (error) {
        console.log('No existing application:', error);
    }
}

function disableForm() {
    const form = document.getElementById('admissionForm');
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea, button[type="submit"]');
        inputs.forEach(input => input.disabled = true);
        
        const message = document.createElement('div');
        message.className = 'alert alert-warning';
        message.style.cssText = 'background: #fff3cd; padding: 15px; margin: 20px; border-radius: 8px; border-left: 4px solid #ffc107;';
        message.innerHTML = '<strong>⚠️ You have already submitted an application.</strong> Multiple applications are not allowed.';
        form.prepend(message);
    }
}

function prefillUserData(user) {
    if (user.studentId) document.getElementById('regNumber').value = user.studentId;
    if (user.email) document.getElementById('email').value = user.email;
    if (user.department) document.getElementById('department').value = user.department;
    if (user.phone) document.getElementById('phone').value = user.phone;
    if (user.name) document.getElementById('studentName').value = user.name;
    
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.readOnly = true;
        emailField.style.backgroundColor = '#f5f5f5';
    }
    
    const regField = document.getElementById('regNumber');
    if (regField && user.studentId) {
        regField.readOnly = true;
        regField.style.backgroundColor = '#f5f5f5';
    }
}

// Handle Admission Form Submission to Backend API
async function handleAdmission(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('user');
    
    if (!token || !currentUser) {
        alert('Session expired. Please login again.');
        localStorage.setItem('redirectAfterLogin', 'admission.html');
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    
    // Get selected quotas
    const selectedQuotas = [];
    document.querySelectorAll('input[name="quota"]:checked').forEach(checkbox => {
        selectedQuotas.push(checkbox.value);
    });
    
    if (selectedQuotas.length === 0) {
        selectedQuotas.push('general');
    }
    
    // Collect form data
    const formData = {
        studentId: document.getElementById('regNumber').value.trim(),
        department: document.getElementById('department').value,
        session: document.getElementById('session').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        fatherName: document.getElementById('fatherName').value.trim(),
        motherName: document.getElementById('motherName').value.trim(),
        permanentAddress: document.getElementById('permanentAddress').value.trim(),
        roll: document.getElementById('roll').value.trim(),
        dob: document.getElementById('dob').value,
        nid: document.getElementById('nid').value.trim(),
        bloodGroup: document.getElementById('bloodGroup').value,
        semester: document.getElementById('semester').value,
        cgpa: parseFloat(document.getElementById('cgpa').value) || 0,
        presentAddress: document.getElementById('presentAddress').value.trim(),
        distanceFromHome: parseFloat(document.getElementById('distanceFromHome').value) || 0,
        guardianName: document.getElementById('guardianName').value.trim(),
        guardianRelation: document.getElementById('guardianRelation').value.trim(),
        guardianPhone: document.getElementById('guardianPhone').value.trim(),
        guardianOccupation: document.getElementById('guardianOccupation').value.trim(),
        quotas: selectedQuotas,
        bankName: document.getElementById('bankName').value || 'Sonali Bank',
        branchName: document.getElementById('branchName').value.trim(),
        accountNumber: document.getElementById('accountNumber').value.trim(),
        receiptNumber: document.getElementById('receiptNumber').value.trim(),
        paymentDate: document.getElementById('paymentDate').value
    };
    
    // Validate required fields
    const requiredFields = ['studentId', 'department', 'session', 'phone', 'fatherName', 'motherName', 'permanentAddress'];
    for (const field of requiredFields) {
        if (!formData[field]) {
            alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
            return;
        }
    }
    
    if (!/^\d{10}$/.test(formData.studentId)) {
        alert('Please enter a valid 10-digit student ID');
        return;
    }
    
    if (!/^01[3-9]\d{8}$/.test(formData.phone)) {
        alert('Please enter a valid Bangladeshi phone number');
        return;
    }
    
    if (formData.cgpa < 0 || formData.cgpa > 4) {
        alert('CGPA must be between 0 and 4');
        return;
    }
    
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/admission/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Application submitted successfully!\n\nYour application is under review.`);
            clearDraft(user);
            window.location.href = 'dashboard.html';
        } else {
            alert(`❌ Submission failed: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Server error. Please try again.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Auto-save draft (local only)
let autoSaveInterval;

function setupAutoSave(user) {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(() => saveDraft(user), 30000);
}

function saveDraft(user) {
    if (!user) return;
    
    const draftData = {
        fatherName: document.getElementById('fatherName')?.value || '',
        motherName: document.getElementById('motherName')?.value || '',
        dob: document.getElementById('dob')?.value || '',
        nid: document.getElementById('nid')?.value || '',
        bloodGroup: document.getElementById('bloodGroup')?.value || '',
        roll: document.getElementById('roll')?.value || '',
        semester: document.getElementById('semester')?.value || '',
        cgpa: document.getElementById('cgpa')?.value || '',
        presentAddress: document.getElementById('presentAddress')?.value || '',
        permanentAddress: document.getElementById('permanentAddress')?.value || '',
        distanceFromHome: document.getElementById('distanceFromHome')?.value || '',
        guardianName: document.getElementById('guardianName')?.value || '',
        guardianRelation: document.getElementById('guardianRelation')?.value || '',
        guardianPhone: document.getElementById('guardianPhone')?.value || '',
        guardianOccupation: document.getElementById('guardianOccupation')?.value || '',
        quotas: Array.from(document.querySelectorAll('input[name="quota"]:checked')).map(cb => cb.value),
        branchName: document.getElementById('branchName')?.value || '',
        accountNumber: document.getElementById('accountNumber')?.value || '',
        receiptNumber: document.getElementById('receiptNumber')?.value || '',
        paymentDate: document.getElementById('paymentDate')?.value || '',
        session: document.getElementById('session')?.value || '',
        department: document.getElementById('department')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('admissionDraft_' + (user.studentId || user.email), JSON.stringify(draftData));
    showSaveIndicator();
}

function loadDraft(user) {
    if (!user) return;
    
    const draft = localStorage.getItem('admissionDraft_' + (user.studentId || user.email));
    if (draft) {
        const draftData = JSON.parse(draft);
        const lastSaved = new Date(draftData.lastSaved);
        const hoursOld = (new Date() - lastSaved) / (1000 * 60 * 60);
        
        if (hoursOld > 24) {
            localStorage.removeItem('admissionDraft_' + (user.studentId || user.email));
            return;
        }
        
        const shouldLoad = confirm(`You have a saved draft from ${lastSaved.toLocaleString()}. Do you want to load it?`);
        
        if (shouldLoad) {
            if (draftData.fatherName) document.getElementById('fatherName').value = draftData.fatherName;
            if (draftData.motherName) document.getElementById('motherName').value = draftData.motherName;
            if (draftData.dob) document.getElementById('dob').value = draftData.dob;
            if (draftData.nid) document.getElementById('nid').value = draftData.nid;
            if (draftData.bloodGroup) document.getElementById('bloodGroup').value = draftData.bloodGroup;
            if (draftData.roll) document.getElementById('roll').value = draftData.roll;
            if (draftData.semester) document.getElementById('semester').value = draftData.semester;
            if (draftData.cgpa) document.getElementById('cgpa').value = draftData.cgpa;
            if (draftData.presentAddress) document.getElementById('presentAddress').value = draftData.presentAddress;
            if (draftData.permanentAddress) document.getElementById('permanentAddress').value = draftData.permanentAddress;
            if (draftData.distanceFromHome) document.getElementById('distanceFromHome').value = draftData.distanceFromHome;
            if (draftData.guardianName) document.getElementById('guardianName').value = draftData.guardianName;
            if (draftData.guardianRelation) document.getElementById('guardianRelation').value = draftData.guardianRelation;
            if (draftData.guardianPhone) document.getElementById('guardianPhone').value = draftData.guardianPhone;
            if (draftData.guardianOccupation) document.getElementById('guardianOccupation').value = draftData.guardianOccupation;
            if (draftData.branchName) document.getElementById('branchName').value = draftData.branchName;
            if (draftData.accountNumber) document.getElementById('accountNumber').value = draftData.accountNumber;
            if (draftData.receiptNumber) document.getElementById('receiptNumber').value = draftData.receiptNumber;
            if (draftData.paymentDate) document.getElementById('paymentDate').value = draftData.paymentDate;
            if (draftData.session) document.getElementById('session').value = draftData.session;
            if (draftData.department) document.getElementById('department').value = draftData.department;
            if (draftData.phone) document.getElementById('phone').value = draftData.phone;
            
            if (draftData.quotas && draftData.quotas.length > 0) {
                document.querySelectorAll('input[name="quota"]').forEach(cb => {
                    cb.checked = draftData.quotas.includes(cb.value);
                });
            }
        }
    }
}

function clearDraft(user) {
    if (user) {
        localStorage.removeItem('admissionDraft_' + (user.studentId || user.email));
    }
}

function showSaveIndicator() {
    let indicator = document.getElementById('saveIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'saveIndicator';
        indicator.style.cssText = `position: fixed; bottom: 20px; right: 20px; background: #4CAF50; color: white; padding: 8px 16px; border-radius: 4px; font-size: 12px; z-index: 1000; opacity: 0; transition: opacity 0.3s;`;
        document.body.appendChild(indicator);
    }
    
    indicator.textContent = '✓ Draft saved';
    indicator.style.opacity = '1';
    setTimeout(() => { indicator.style.opacity = '0'; }, 2000);
}

// File upload validation
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB!');
            this.value = '';
        }
    });
});

window.handleAdmission = handleAdmission;