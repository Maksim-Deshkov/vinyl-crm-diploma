// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// --- Routes ---
const usersRouter   = require('./routes/users');
const vinylsRouter  = require('./routes/vinyls');
const ordersRouter  = require('./routes/orders');
const reviewsRouter = require('./routes/reviews');
const uploadsRouter = require('./routes/uploads');

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploads publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/users',   usersRouter);
app.use('/api/vinyls',  vinylsRouter);
app.use('/api/orders',  ordersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/uploads', uploadsRouter);

// Not found for API
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  next();
});
// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

mongoose
  .connect('mongodb://127.0.0.1:27017/diploma', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
