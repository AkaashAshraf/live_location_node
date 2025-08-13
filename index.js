const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
const filePath = './locations.json';

app.use(express.json());

// Load existing locations from file
let locations = [];
if (fs.existsSync(filePath)) {
  const data = fs.readFileSync(filePath);
  locations = JSON.parse(data);
}

// Save to file
function saveToFile() {
  fs.writeFileSync(filePath, JSON.stringify(locations, null, 2));
}

// POST endpoint to receive location
app.post('/location', (req, res) => {
  const location = req.body;
  locations.push(location);
  saveToFile();
  console.log('Received location:', location);
  res.send({ message: 'Location saved' });
});

// GET endpoint to retrieve all locations
app.get('/locations', (req, res) => {
  res.send(locations);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
