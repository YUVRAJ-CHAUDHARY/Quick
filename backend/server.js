require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/error');

// Routes Import
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Database se connect karo
connectDB();

const app = express();
const httpServer = http.createServer(app);

// --- 1. MIDDLEWARES (Inka Order Bohot Zaroori Hai) ---

// CORS allow karo frontend ke liye
app.use(cors({ 
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true 
}));

// Body Parser: Iske bina req.body undefined aayega
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- 2. SOCKET.IO SETUP ---
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Controllers mein socket use karne ke liye
app.set('io', io);

// --- 3. ROUTES ---

// Root Route
app.get('/', (req, res) => {
  res.send('Quick API is running... 🚀');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Quick API is running 🚀' });
});

// --- 4. SOCKET.IO EVENTS ---
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// --- 5. ERROR HANDLING (Ye hamesha last mein aate hain) ---
app.use(notFound);
app.use(errorHandler);

// --- 6. SERVER START ---
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Quick Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Auth Login: http://localhost:${PORT}/api/auth/login\n`);
});