const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();
connectDB();

const app = express();



app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admission', require('./routes/admission'));
app.use('/api/seats', require('./routes/seats'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Root test
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Bijoy '24 Hall API running"
  });
});

// IMPORTANT: Redirect student-login.html to login.html
app.get('/student-login.html', (req, res) => {
  res.redirect('/login.html');
});

// Also handle /student-login (without .html)
app.get('/student-login', (req, res) => {
  res.redirect('/login.html');
});

// 404 Handler
app.use((req, res) => {
  // If requesting HTML, serve 404 page instead of JSON
  if (req.url.includes('.html')) {
    res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
  } else {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`
    });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Server Error'
  });
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});