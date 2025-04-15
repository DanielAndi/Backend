const express = require("express");
const app = express();
require('dotenv').config();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/recipes', require('./routes/recipes'));

// Server start
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
