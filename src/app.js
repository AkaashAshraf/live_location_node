const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const locationRoutes = require('./routes/locationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', locationRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://192.168.1.4:${PORT}`);
});
