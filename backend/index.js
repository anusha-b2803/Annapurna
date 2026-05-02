const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Trust proxy for rate limiting (needed on platforms like Render)
app.set('trust proxy', 1);

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20, // limit each IP to 20 requests per window
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 comments/likes per hour
  message: { message: 'Action limit reached, please try again later' }
});
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/public', require('./routes/public'));
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/social', feedbackLimiter, require('./routes/social'));
app.use('/api/tracking', require('./routes/tracking'));

const TrackingPath = require('./models/TrackingPath');

// Socket.io events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('leave_room', (room) => {
    socket.leave(room);
  });

  socket.on('volunteer_location_update', async (data) => {
    // Broadcast to the room
    io.to(`tracking_${data.donationId}`).emit('location_updated', data);
    
    // Persist to DB (sampled or always, for now always since updates are usually throttled on frontend)
    try {
      if (data.donationId && data.lat && data.lng) {
        await TrackingPath.findOneAndUpdate(
          { donation: data.donationId },
          { $push: { path: { lat: data.lat, lng: data.lng, timestamp: new Date() } } },
          { upsert: true }
        );
      }
    } catch (err) {
      console.error('Failed to persist tracking path:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Serve Static Files
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
console.log(`🔍 Checking for static files at: ${frontendPath}`);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendPath));
  console.log('🚀 Serving static files in production mode');

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'), (err) => {
      if (err) {
        console.error('❌ Error sending index.html:', err);
        res.status(500).send('Frontend build not found. Ensure you ran "npm run build" in the frontend folder.');
      }
    });
  });
} else {
  console.log('ℹ️ Running in development mode (static files not served by backend)');
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/annapurna')
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = { app, io };
