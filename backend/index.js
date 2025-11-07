const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'dist')));

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/auth')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});