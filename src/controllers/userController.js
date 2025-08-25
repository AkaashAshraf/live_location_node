const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    const { status } = req.query; // optional: filter by status

    const filter = {};
    if (status) {
      filter.status = status; // only online/offline users if provided
    }

    const users = await User.find(filter).sort({ updatedAt: -1 });

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};