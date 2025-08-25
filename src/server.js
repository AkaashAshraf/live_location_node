const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

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

// Start server
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
