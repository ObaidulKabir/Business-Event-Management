const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import routes
const eventsRouter = require('../routes/events');
const contactsRouter = require('../routes/contacts');
const categoriesRouter = require('../routes/categories');
const searchRouter = require('../routes/search');
const reportsRouter = require('../routes/reports');

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/search', searchRouter);
app.use('/api/reports', reportsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Business Event Manager API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

module.exports = app;
