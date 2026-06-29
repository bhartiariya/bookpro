require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const errorHandler        = require('./middleware/errorHandler');
const { generalLimiter }  = require('./middleware/rateLimiter');

// Route imports (add each as you build them)
const authRoutes         = require('./modules/auth/auth.routes');
const userRoutes         = require('./modules/users/users.routes');
const serviceRoutes      = require('./modules/services/services.routes');
const slotRoutes         = require('./modules/slots/slots.routes');
const bookingRoutes      = require('./modules/bookings/bookings.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
// (uncomment as you build each phase)

const app = express();

// --- Security middleware ---
app.use(helmet());             // sets secure HTTP headers

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com'
    : 'http://localhost:5173',  // Vite dev server
  credentials: true,
}));

// --- Request parsing ---
app.use(express.json({ limit: '10kb' }));        // body size limit prevents payload attacks
app.use(express.urlencoded({ extended: true }));

// --- Logging ---
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// --- Rate limiting ---
app.use('/api', generalLimiter);

// --- Health check (no auth, no rate limit) ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- API routes ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users',         userRoutes);
app.use('/api/v1/services',      serviceRoutes);
app.use('/api/v1/slots',         slotRoutes);
app.use('/api/v1/bookings',      bookingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
// app.use('/api/v1/reviews',       reviewRoutes);
// app.use('/api/v1/analytics',     analyticsRoutes);

// --- 404 handler (must be after all routes) ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// --- Central error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
