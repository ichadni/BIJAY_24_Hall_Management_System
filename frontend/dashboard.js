const API_BASE = "http://localhost:5500/api";

// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {

    authCheck();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    loadDashboardData(user);
    bindLogout();
});

// ==============================
// AUTH CHECK
// ==============================
function authCheck() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token || !user) {
        window.location.href = "student-login.html";
        return;
    }

    if (user.role !== "student") {
        window.location.href = "login.html";
    }
}

// ==============================
// LOAD DASHBOARD DATA
// ==============================
async function loadDashboardData(user) {

    const nameEl = document.getElementById("userName");
    const initEl = document.getElementById("userInitial");

    if (nameEl) nameEl.textContent = user.name || "Student";
    if (initEl) initEl.textContent = user.name?.charAt(0)?.toUpperCase() || "S";

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_BASE}/admission/my`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();

        const statusEl = document.getElementById("applicationStatus");

        if (!statusEl) return;

        if (data.success && data.data) {
            const app = data.data;

            const map = {
                pending: "Under Review ⏳",
                approved: "Approved ✓",
                rejected: "Rejected ✗"
            };

            statusEl.textContent = map[app.admissionStatus] || "Unknown";

            const roomEl = document.getElementById("roomNumber");
            if (roomEl) {
                roomEl.textContent = app.roomNumber
                    ? "Room " + app.roomNumber
                    : "Not Allocated";
            }

            const feeEl = document.getElementById("feeStatus");
            if (feeEl) {
                feeEl.textContent =
                    app.admissionStatus === "approved" ? "Paid ✓" : "Pending";
            }

        } else {
            statusEl.textContent = "Not Applied";
        }

    } catch (err) {
        console.error("Dashboard error:", err);
        const statusEl = document.getElementById("applicationStatus");
        if (statusEl) statusEl.textContent = "Error";
    }
}

// ==============================
// LOGOUT (FIXED PROPERLY)
// ==============================
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// attach event safely
function bindLogout() {
    const btn = document.getElementById("logoutBtn");

    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();

            if (confirm("Are you sure you want to logout?")) {
                logout();
            }
        });
    }
}

// global access (important)
window.logout = logout;