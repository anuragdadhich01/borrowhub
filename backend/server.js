const express = require('express');
const mongoose = require('mongoose');
const config = require('config'); // Make sure this line is here

const app = express();

// Middleware
app.use(express.json());

// Use Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/items', require('./routes/api/items'));
app.use('/api/bookings', require('./routes/api/bookings'));

// DB Config
const db = config.get('mongoURI');

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));