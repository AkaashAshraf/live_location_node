require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

// Configure CORS
const allowedOrigins = [
  "http://localhost",
  "http://10.34.165.130",
  "http://10.34.165.130:3000",
  "http://localhost:3000",
  "http://localhost:5173"
];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// MongoDB Models
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
  lat: Number,
  long: Number,
  lastUpdated: Date
});

const tripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  started_at: { type: Date, default: Date.now },
  ended_at: Date,
  locations: [{
    lat: Number,
    long: Number,
    timestamp: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', userSchema);
const Trip = mongoose.model('Trip', tripSchema);

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/driver_tracking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// API Endpoints
app.post('/api/location', async (req, res) => {
  try {
    const { userId, lat, long, status, started_at, ended_at } = req.body;

    // Validate required fields
    if (!userId || lat === undefined || long === undefined || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update user status and location
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      {
        lat: parseFloat(lat),
        long: parseFloat(long),
        status,
        lastUpdated: new Date()
      },
      { new: true, upsert: true }
    );

    // Handle trip recording
    if (status === 'online' && started_at) {
      await Trip.findOneAndUpdate(
        { userId, ended_at: null },
        {
          $setOnInsert: { started_at: new Date(started_at) },
          $push: { 
            locations: { 
              lat: parseFloat(lat),
              long: parseFloat(long)
            } 
          }
        },
        { upsert: true, new: true }
      );
    } else if (status === 'offline' && ended_at) {
      await Trip.findOneAndUpdate(
        { userId, ended_at: null },
        { ended_at: new Date(ended_at) }
      );
    }

    // Broadcast real-time update
    io.emit('user:update', {
      id: updatedUser._id,
      userId: updatedUser.userId,
      name: updatedUser.name || `User ${userId}`,
      status: updatedUser.status,
      lat: updatedUser.lat,
      long: updatedUser.long,
      updatedAt: updatedUser.lastUpdated
    });

    res.json({ success: true, user: updatedUser });

  } catch (err) {
    console.error('Location update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});