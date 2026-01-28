const express = require('express');
const router = express.Router();
const db = require('../database/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// GET all events with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, contact, startDate, endDate, platform } = req.query;
    
    let sql = `
      SELECT e.*, c.name as contact_name, cat.name as category_name, cat.color as category_color
      FROM events e
      LEFT JOIN contacts c ON e.contact_id = c.id
      LEFT JOIN categories cat ON e.category_id = cat.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ' AND e.category_id = ?';
      params.push(category);
    }
    if (contact) {
      sql += ' AND e.contact_id = ?';
      params.push(contact);
    }
    if (startDate) {
      sql += ' AND e.event_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND e.event_date <= ?';
      params.push(endDate);
    }
    if (platform) {
      sql += ' AND e.platform = ?';
      params.push(platform);
    }

    sql += ' ORDER BY e.event_date DESC';

    const events = await db.all(sql, params);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await db.get(`
      SELECT e.*, c.name as contact_name, c.email as contact_email, 
             cat.name as category_name, cat.color as category_color
      FROM events e
      LEFT JOIN contacts c ON e.contact_id = c.id
      LEFT JOIN categories cat ON e.category_id = cat.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get attachments for this event
    const attachments = await db.all(
      'SELECT * FROM attachments WHERE event_id = ?',
      [req.params.id]
    );

    res.json({ ...event, attachments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new event
router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    const { title, description, event_date, contact_id, category_id, platform, notes } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({ error: 'Title and event date are required' });
    }

    const result = await db.run(
      `INSERT INTO events (title, description, event_date, contact_id, category_id, platform, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, event_date, contact_id || null, category_id || null, platform, notes]
    );

    const eventId = result.id;

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.run(
          `INSERT INTO attachments (event_id, file_name, file_path, file_type, file_size)
           VALUES (?, ?, ?, ?, ?)`,
          [eventId, file.originalname, file.filename, file.mimetype, file.size]
        );
      }
    }

    res.status(201).json({ id: eventId, message: 'Event created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update event
router.put('/:id', async (req, res) => {
  try {
    const { title, description, event_date, contact_id, category_id, platform, notes } = req.body;

    const result = await db.run(
      `UPDATE events 
       SET title = ?, description = ?, event_date = ?, contact_id = ?, 
           category_id = ?, platform = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description, event_date, contact_id || null, category_id || null, platform, notes, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    // Get attachments to delete files
    const attachments = await db.all('SELECT * FROM attachments WHERE event_id = ?', [req.params.id]);
    
    // Delete physical files
    for (const attachment of attachments) {
      const filePath = path.join(__dirname, '../../uploads', attachment.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete event (attachments will be deleted by CASCADE)
    const result = await db.run('DELETE FROM events WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
