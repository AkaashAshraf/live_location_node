const locationController = require('../controllers/locationController');

function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('🔌 A user connected:', socket.id);

    socket.on('user_online', (userId) => {
      locationController.updateUserStatus(userId, 'online');
      io.emit('status_update', { userId, status: 'online' });
    });

    socket.on('user_offline', (userId) => {
      locationController.updateUserStatus(userId, 'offline');
      io.emit('status_update', { userId, status: 'offline' });
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });
}

module.exports = { initSocket };
