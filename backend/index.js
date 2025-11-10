const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

const routes = require('./routes');
app.use('/', routes);

app.get('/', (req, res) => {
  res.send('VT-Annotator API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});