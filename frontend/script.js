// ==============================
// CONFIG
// ==============================
const API_BASE = "http://localhost:5500/api";
// (Better than hardcoding localhost)

// ==============================
// MOBILE MENU (SAFE)
// ==============================
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        const spans = menuToggle.querySelectorAll('span');

        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');

            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

// ==============================
// AUTH SYSTEM
// ==============================
function checkAuth(requiredRole = null) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user) {
        window.location.href = "login.html";
        return false;
    }

    if (requiredRole && user.role !== requiredRole) {
        alert("Access denied!");
        window.location.href = "login.html";
        return false;
    }

    return true;
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("Logged out successfully");
    window.location.href = "login.html";
}

// ==============================
// LOGIN
// ==============================
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        console.log("LOGIN RESPONSE:", data); // DEBUG

        if (res.ok && data.token && data.user) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            alert("Login successful!");

            const role = data.user.role;

            if (role === "student") {
                window.location.href = "student-dashboard.html";
            } else if (role === "staff") {
                window.location.href = "staff-dashboard.html";
            } else {
                window.location.href = "admin-dashboard.html";
            }
        } else {
            alert(data.message || "Login failed");
        }

    } catch (err) {
        alert("Server error");
    }
}

// ==============================
// REGISTER
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

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        } else {
            alert(data.message || "Registration failed");
        }

    } catch (err) {
        alert("Server error");
    }
}

// ==============================
// SHOW LOGIN (FIXED MISSING FUNCTION)
// ==============================
function showLogin() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm && registerForm) {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
    }
}

// ==============================
// COUNTER ANIMATION
// ==============================
function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
        current += increment;

        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ==============================
// STATS ANIMATION
// ==============================
const statsSection = document.querySelector('.stats');

if (statsSection) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');

                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    animateCounter(stat, target);
                });
            }
        });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
}

// ==============================
// SMOOTH SCROLL (SAFE)
// ==============================
const anchors = document.querySelectorAll('a[href^="#"]');

if (anchors.length) {
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: "smooth"
                });
            }
        });
    });
}

// ==============================
// HEADER SHADOW
// ==============================
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');

    if (header) {
        header.style.boxShadow =
            window.scrollY > 50
                ? '0 4px 20px rgba(0,0,0,0.15)'
                : '0 2px 10px rgba(0,0,0,0.1)';
    }
});

// ==============================
// HERO ANIMATION
// ==============================
const heroContent = document.querySelector('.hero-content');

if (heroContent) {
    let y = 0;
    let dir = 1;

    setInterval(() => {
        y += 0.5 * dir;

        if (y > 10 || y < -10) dir *= -1;

        heroContent.style.transform = `translateY(${y}px)`;
    }, 50);
}

// ==============================
// INIT
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    console.log("Bijoy 24 Hall System Ready");

    const hero = document.querySelector('.hero');

    if (hero) {
        hero.style.opacity = '0';

        setTimeout(() => {
            hero.style.transition = '1s';
            hero.style.opacity = '1';
        }, 100);
    }
});