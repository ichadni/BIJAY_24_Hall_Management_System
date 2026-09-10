const API_BASE = 'http://localhost:5500/api';

// ==============================
// TOKEN HELPERS
// ==============================
const getToken = () => localStorage.getItem('token');

const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user || user === "undefined" || user === "null") return null;
    return JSON.parse(user);
  } catch {
    return null;
  }
};

const setSession = (token, user) => {
  if (!token || !user) return;

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ==============================
// BASE API REQUEST (FIXED ERROR HANDLING)
// ==============================
async function apiRequest(endpoint, method = 'GET', body = null, auth = true) {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = getToken();

  if (auth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);

  // FIX: handle empty response safely
  let data = {};
  const text = await res.text();

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

// ==============================
// AUTH API
// ==============================
const Auth = {
  async login(email, password) {
    const data = await apiRequest('/auth/login', 'POST', { email, password }, false);

    setSession(data.token, data.user);

    return data;
  },

  async register(name, email, password, role = 'student', extras = {}) {
    const data = await apiRequest(
      '/auth/register',
      'POST',
      { name, email, password, role, ...extras },
      false
    );

    setSession(data.token, data.user);

    return data;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', 'POST');
    } catch (err) {
      console.log("Logout API failed, clearing locally");
    }

    clearSession();
    window.location.href = 'login.html';
  },

  getMe: () => apiRequest('/auth/me'),

  isLoggedIn: () => !!getToken(),

  getUser,

  requireAuth(allowedRoles = []) {
    const user = getUser();

    if (!user || !user.role) {
      window.location.href = 'login.html';
      return false;
    }

    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      alert('Access denied');
      window.location.href = 'login.html';
      return false;
    }

    return true;
  }
};

// ==============================
// ADMISSION API
// ==============================
const Admission = {
  apply: (data) => apiRequest('/admission/apply', 'POST', data),
  getMyApplication: () => apiRequest('/admission/my-application'),
  getAllApplications: (status = '') =>
    apiRequest(`/admission/all${status ? '?status=' + status : ''}`),
  updateStatus: (id, status) =>
    apiRequest(`/admission/${id}/status`, 'PUT', { status })
};

// ==============================
// SEATS API
// ==============================
const Seats = {
  getAll: () => apiRequest('/seats'),
  getAvailable: () => apiRequest('/seats/available'),
  allocate: (studentId, seatNumber) =>
    apiRequest(`/seats/allocate/${studentId}`, 'PUT', { seatNumber }),
  deallocate: (studentId) =>
    apiRequest(`/seats/deallocate/${studentId}`, 'PUT'),
  seedSeats: (config = {}) =>
    apiRequest('/seats/seed', 'POST', config)
};

// ==============================
// COMPLAINTS API
// ==============================
const Complaints = {
  submit: (data) => apiRequest('/complaints', 'POST', data),
  getMy: () => apiRequest('/complaints/my'),
  getAll: (filters = {}) => {
    const q = new URLSearchParams(filters).toString();
    return apiRequest(`/complaints${q ? '?' + q : ''}`);
  },
  updateStatus: (id, status, adminNote = '') =>
    apiRequest(`/complaints/${id}/status`, 'PUT', { status, adminNote }),
  delete: (id) => apiRequest(`/complaints/${id}`, 'DELETE')
};

// ==============================
// DASHBOARD API
// ==============================
const Dashboard = {
  admin: () => apiRequest('/dashboard/admin'),
  staff: () => apiRequest('/dashboard/staff'),
  student: () => apiRequest('/dashboard/student')
};

// ==============================
// UI HELPERS
// ==============================
function showError(message, elementId = 'error-msg') {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  } else {
    alert(message);
  }
}

function showSuccess(message, elementId = 'success-msg') {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  } else {
    alert(message);
  }
}