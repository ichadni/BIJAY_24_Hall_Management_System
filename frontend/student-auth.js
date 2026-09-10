const API_BASE = "http://localhost:5500/api/auth";

// ==============================
// LOGIN WITH REDIRECT SUPPORT & ROLE VERIFICATION
// ==============================
async function handleLogin(event) {
    event.preventDefault();

    const loginId = document.getElementById("loginId").value.trim();
    const password = document.getElementById("loginPassword").value;
    const selectedRole = document.getElementById("loginRole").value;  // Get selected role

    if (!loginId || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: loginId,
                password
            })
        });

        const data = await res.json();

        console.log("LOGIN RESPONSE:", data);

        if (!res.ok || !data.success) {
            alert(data.message || "Login failed");
            return;
        }

        // ==============================
        // ROLE VERIFICATION - IMPORTANT!
        // ==============================
        const userRole = data.user.role.toLowerCase();
        const selectedRoleLower = selectedRole.toLowerCase();
        
        // Check if selected role matches actual user role
        if (userRole !== selectedRoleLower) {
            alert(`Access denied! This account is registered as ${userRole}, not as ${selectedRole}`);
            return;
        }

        // Save auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // ==============================
        // CHECK FOR REDIRECT AFTER LOGIN
        // ==============================
        let redirectUrl = null;
        
        // Check from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        redirectUrl = urlParams.get('redirect');
        
        // Check from window.pendingRedirect (set in login.html)
        if (!redirectUrl && window.pendingRedirect) {
            redirectUrl = window.pendingRedirect;
            window.pendingRedirect = null;
        }
        
        // If not in URL, check localStorage
        if (!redirectUrl) {
            redirectUrl = localStorage.getItem('redirectAfterLogin');
            localStorage.removeItem('redirectAfterLogin');
        }
        
        // If there's a redirect URL, use it
        if (redirectUrl && redirectUrl !== 'null' && redirectUrl !== 'undefined') {
            console.log("Redirecting to saved URL:", redirectUrl);
            window.location.href = redirectUrl;
            return;
        }

        // ==============================
        // ROLE-BASED REDIRECT
        // ==============================
        const userRoleNorm = (data.user.role || "").toLowerCase().replace("_", "-").trim();
        
        const roleRedirect = {
            "admin": "staff-dashboard.html",
            "staff": "staff-dashboard.html",
            "hall-admin": "staff-dashboard.html", 
            "student": "student-dashboard.html"
        };

        const redirectTarget = roleRedirect[userRoleNorm] || "student-dashboard.html";
        console.log(`Redirecting ${userRoleNorm} to: ${redirectTarget}`);
        window.location.href = redirectTarget;

    } catch (err) {
        console.error(err);
        alert("Server error: " + err.message);
    }
}

// ==============================
// REGISTER
// ==============================
async function handleRegister(event) {
    event.preventDefault();

    const role = document.getElementById("registerRole").value;
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    const studentIdInput = document.getElementById("regStudentId");
    const studentId = studentIdInput ? studentIdInput.value.trim() : "";

    if (!name || !email || !password || !phone) {
        alert("Fill required fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const payload = {
        name,
        email,
        password,
        role,
        phone
    };

    if (role === "student" && studentId) {
        payload.studentId = studentId;
    }

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        console.log("REGISTER RESPONSE:", data);

        if (!res.ok || !data.success) {
            alert(data.message || "Registration failed");
            return;
        }

        alert("Registration successful! Please login.");
        
        // Preserve redirect if it exists
        const savedRedirect = window.pendingRedirect || localStorage.getItem('redirectAfterLogin');
        if (savedRedirect) {
            localStorage.setItem('redirectAfterLogin', savedRedirect);
        }

        showLogin();
        
        // Reset form
        const registerForm = document.getElementById("registerForm");
        if (registerForm) {
            const form = registerForm.querySelector("form");
            if (form) form.reset();
        }

    } catch (err) {
        console.error(err);
        alert("Server error: " + err.message);
    }
}

// ==============================
// UI TOGGLE
// ==============================
function showLogin() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    
    if (loginForm) loginForm.classList.add("active");
    if (registerForm) registerForm.classList.remove("active");
    
    const tabs = document.querySelectorAll(".auth-tab");
    if (tabs[0]) tabs[0].classList.add("active");
    if (tabs[1]) tabs[1].classList.remove("active");
}

function showRegister() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    
    if (registerForm) registerForm.classList.add("active");
    if (loginForm) loginForm.classList.remove("active");
    
    const tabs = document.querySelectorAll(".auth-tab");
    if (tabs[1]) tabs[1].classList.add("active");
    if (tabs[0]) tabs[0].classList.remove("active");
}

// ==============================
// CHECK LOGIN STATUS FOR PROTECTED PAGES
// ==============================
function requireAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!token || !user) {
        localStorage.setItem('redirectAfterLogin', currentPage);
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function checkStudentAccess() {
    const user = localStorage.getItem('user');
    if (user) {
        const userData = JSON.parse(user);
        if (userData.role !== 'student') {
            alert('This page is only for students.');
            window.location.href = 'staff-dashboard.html';
            return false;
        }
    }
    return true;
}

function checkAdminAccess() {
    const user = localStorage.getItem('user');
    if (user) {
        const userData = JSON.parse(user);
        const allowedRoles = ['admin', 'staff', 'hall-admin'];
        if (!allowedRoles.includes(userData.role)) {
            alert('Access denied. Staff area only.');
            window.location.href = 'student-dashboard.html';
            return false;
        }
    }
    return true;
}

// ==============================
// LOGOUT FUNCTION
// ==============================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = 'index.html';
    }
}

// ==============================
// EXPORT
// ==============================
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.requireAuth = requireAuth;
window.checkStudentAccess = checkStudentAccess;
window.checkAdminAccess = checkAdminAccess;
window.logout = logout;