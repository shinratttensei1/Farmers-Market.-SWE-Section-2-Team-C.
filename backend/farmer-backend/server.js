const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads')); // Serve images statically

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Endpoints

// Add a product
app.post('/products', upload.array('images', 5), (req, res) => {
  const { name, category, price, quantity, description } = req.body;
  const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

  const query = `
    INSERT INTO products (name, category, price, quantity, description, images)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [name, category, price, quantity, description, JSON.stringify(imagePaths)];

  db.run(query, params, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to add product.');
    }
    res.status(201).send({ id: this.lastID });
  });
});

// Get all products
app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to fetch products.');
    }
    res.status(200).send(rows);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
