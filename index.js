const express = require("express");
const app = express();
require('dotenv').config();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/recipes', require('./routes/recipes'));
//new routes for blogs, follows, likes, and comments
app.use('/blogs', require('./routes/blogs'));
app.use('/profiles', require('./routes/profiles'));
app.use('/follows', require('./routes/follows'));
app.use('/likes', require('./routes/likes'));
app.use('/comments', require('./routes/comments'));

// Server start

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});




