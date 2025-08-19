const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const locationRoutes = require('./routes/locationRoutes');
const { initSocket } = require('./services/socketService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Live Location Server is running!');
});

// Routes
app.use('/api/locations', locationRoutes);

// Initialize Socket Service
initSocket(io);

const PORT = process.env.PORT || 3000;

// 👇 Important: bind to 0.0.0.0 so it's accessible externally
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
