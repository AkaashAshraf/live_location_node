const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');          // ✅ needed for Socket.io
const { Server } = require('socket.io'); // ✅ Socket.io server

const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*', // allow all origins, change to your frontend URL in production
  },
});

// Listen for client connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible in routes/controllers
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const locationRoutes = require('./routes/locationRoutes');
const tripRoutes = require("./routes/tripRoutes");

// Use routes
app.use('/api/locations', locationRoutes);
app.use("/api/trips", tripRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('🚀 Server is running...');
});

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/locationdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Start server using `server` (not app)
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
