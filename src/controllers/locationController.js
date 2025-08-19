// Dummy DB or model calls (replace with actual DB code)
const locationData = {};
const userStatus = {};

exports.getUsers = (req, res) => {
  res.json({ success: true, users: Object.keys(locationData) });
};

exports.getTripByUserAndDate = (req, res) => {
  const { userId, date } = req.params;
  res.json({
    success: true,
    trip: locationData[userId]?.[date] || []
  });
};

exports.updateLocation = (req, res) => {
  const { userId, lat, lng, date } = req.body;
  if (!locationData[userId]) locationData[userId] = {};
  if (!locationData[userId][date]) locationData[userId][date] = [];

  locationData[userId][date].push({ lat, lng, time: new Date() });
  res.json({ success: true, message: 'Location updated' });
};

exports.getUserLiveStatus = (req, res) => {
  res.json({ success: true, status: userStatus });
};

// This will be called from Socket Service
exports.updateUserStatus = (userId, status) => {
  userStatus[userId] = status;
};
