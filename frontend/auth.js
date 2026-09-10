// ==============================
// Toggle Login / Register
// ==============================
function showLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');

    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');

    document.querySelectorAll('.auth-tab')[1].classList.add('active');
    document.querySelectorAll('.auth-tab')[0].classList.remove('active');
}

// ==============================
// LOGIN (BACKEND CONNECTED)
// ==============================
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch("http://localhost:5500/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            alert("Login successful! Welcome " + data.user.name);

            window.location.href = "dashboard.html";
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}

// ==============================
// REGISTER (BACKEND CONNECTED)
// ==============================
async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('regName').value;
    const studentId = document.getElementById('regNo').value;
    const email = document.getElementById('regEmail').value;
    const department = document.getElementById('regDepartment').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
    }

    try {
        const res = await fetch("http://localhost:5500/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password,
                role: "student",
                studentId,
                department,
                phone
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Registration successful!");
            showLogin();

            document.getElementById('registerForm').querySelector('form').reset();
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}

// ==============================
// AUTO LOGIN CHECK
// ==============================
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (token && window.location.pathname.includes('login.html')) {
        if (confirm('You are already logged in. Go to dashboard?')) {
            window.location.href = 'dashboard.html';
        }
    }
});