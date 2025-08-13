const Trip = require("../models/Trip");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// Utility function for date handling
const getStartAndEndOfDay = (date) => {
  const dateObj = new Date(date);
  if (isNaN(dateObj)) return null;
  
  const start = new Date(dateObj);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(dateObj);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

exports.getAllUsers = async (req, res) => {
  try {
    // Check database connection first
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false,
        message: "Database not connected" 
      });
    }

    const userIds = await Trip.distinct("userId");
    
    // If no users with trips found
    if (!userIds.length) {
      return res.json({ 
        success: true,
        message: "No users with trips found",
        users: [] 
      });
    }

    const users = await User.find({ userId: { $in: userIds } })
      .select('userId name status lat long lastUpdated')
      .lean();

    const result = users.map(user => ({
      id: user.userId,
      name: user.name || `User ${user.userId}`,
      status: user.status || 'offline',
      ...(user.lat && user.long && {
        position: {
          lat: user.lat,
          lng: user.long
        }
      }),
      lastUpdated: user.lastUpdated?.toISOString() || new Date().toISOString()
    }));

    res.json({ 
      success: true,
      count: result.length,
      users: result 
    });

  } catch (error) {
    console.error("Error in getAllUsers:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date()
    });
    
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      })
    });
  }
};
// Add location and manage trips
exports.addLocation = async (req, res) => {
  try {
    const { userId, lat, long, timestamp, ended_at } = req.body;

    // Validate required fields
    if (!userId || lat === undefined || long === undefined) {
      return res.status(400).json({ 
        message: "Missing required fields: userId, lat, and long are required" 
      });
    }

    const now = new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find or create trip
    let trip = await Trip.findOneAndUpdate(
      { userId, date: dateOnly, ended_at: null },
      { $setOnInsert: { 
        userId, 
        date: dateOnly, 
        started_at: now,
        locations: [] 
      }},
      { upsert: true, new: true }
    );

    // Add location
    trip.locations.push({
      lat: parseFloat(lat),
      long: parseFloat(long),
      timestamp: timestamp ? new Date(timestamp) : now
    });

    // End trip if specified
    if (ended_at) {
      trip.ended_at = new Date(ended_at);
    }

    await trip.save();
    
    res.json({ 
      success: true,
      message: "Location saved successfully",
      trip: {
        id: trip._id,
        userId: trip.userId,
        locationsCount: trip.locations.length
      }
    });
  } catch (err) {
    console.error("Add Location Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to save location",
      error: err.message
    });
  }
};

// Get trips by date
exports.getTripsByDate = async (req, res) => {
  try {
    const { userId, date } = req.params;
    const dateRange = getStartAndEndOfDay(date);
    
    if (!dateRange) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD" 
      });
    }

    const trips = await Trip.find({
      userId,
      date: { $gte: dateRange.start, $lte: dateRange.end }
    }).select('started_at ended_at locations');

    if (!trips.length) {
      return res.status(404).json({
        success: false,
        message: "No trips found for the specified date"
      });
    }

    res.json({ 
      success: true,
      count: trips.length,
      trips: trips.map(trip => ({
        id: trip._id,
        started: trip.started_at,
        ended: trip.ended_at,
        locationsCount: trip.locations.length
      }))
    });
  } catch (err) {
    console.error("Get Trips Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch trips",
      error: err.message
    });
  }
};

// Update user status and location
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId, name, status, lat, long } = req.body;
    const io = req.app.get('socketio'); // Get the io instance

    if (!io) {
      throw new Error("Socket.IO not initialized");
    }

    // Validate input
    if (!userId || !status) {
      return res.status(400).json({ 
        success: false,
        message: "userId and status are required" 
      });
    }

    // Update user in database
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { name, status, lat, long, lastUpdated: new Date() },
      { new: true, upsert: true }
    );

    // Prepare data for broadcast
    const broadcastData = {
      id: updatedUser._id,
      userId: updatedUser.userId,
      name: updatedUser.name,
      status: updatedUser.status,
      lat: updatedUser.lat,
      long: updatedUser.long,
      updatedAt: updatedUser.lastUpdated
    };

    // Emit to all connected clients
    console.log(`[REALTIME] Emitting update for ${userId}`);
    io.emit('user:update', broadcastData);

    res.json({
      success: true,
      user: broadcastData
    });

  } catch (err) {
    console.error("[UPDATE ERROR]", {
      error: err.message,
      body: req.body,
      time: new Date()
    });
    res.status(500).json({ 
      success: false,
      message: err.message.includes('Socket.IO') 
        ? "Real-time updates unavailable" 
        : err.message
    });
  }
};

// Get all users with status
exports.getUsersWithStatus = async (req, res) => {
  try {
    const users = await User.find({})
      .select('userId name status lat long lastUpdated')
      .sort({ lastUpdated: -1 })
      .lean();

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "No users found"
      });
    }

    res.json({ 
      success: true,
      count: users.length,
      users: users.map(user => ({
        ...user,
        lastUpdated: user.lastUpdated.toISOString()
      }))
    });
  } catch (err) {
    console.error("Error fetching users with status:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch users",
      error: err.message
    });
  }
};

// Additional helper methods

/**
 * Export trips data to JSON file
 */
exports.exportTripsToJson = async (userId) => {
  try {
    const trips = await Trip.find({ userId });
    const fileName = `${userId}_trips_${Date.now()}.json`;
    const filePath = path.join(__dirname, '../exports', fileName);
    
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, JSON.stringify(trips, null, 2));
    
    return { success: true, filePath };
  } catch (err) {
    console.error("Export Error:", err);
    return { success: false, error: err.message };
  }
};