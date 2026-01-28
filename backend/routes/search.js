const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET search events, contacts, and attachments
router.get('/', async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = `%${q}%`;
    const results = {};

    // Search events
    if (!type || type === 'events') {
      results.events = await db.all(`
        SELECT e.*, c.name as contact_name, cat.name as category_name, cat.color as category_color
        FROM events e
        LEFT JOIN contacts c ON e.contact_id = c.id
        LEFT JOIN categories cat ON e.category_id = cat.id
        WHERE e.title LIKE ? OR e.description LIKE ? OR e.notes LIKE ?
        ORDER BY e.event_date DESC
        LIMIT 50
      `, [searchTerm, searchTerm, searchTerm]);
    }

    // Search contacts
    if (!type || type === 'contacts') {
      results.contacts = await db.all(`
        SELECT * FROM contacts
        WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ? OR notes LIKE ?
        ORDER BY name ASC
        LIMIT 50
      `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]);
    }

    // Search attachments
    if (!type || type === 'attachments') {
      results.attachments = await db.all(`
        SELECT a.*, e.title as event_title
        FROM attachments a
        JOIN events e ON a.event_id = e.id
        WHERE a.file_name LIKE ?
        ORDER BY a.uploaded_at DESC
        LIMIT 50
      `, [searchTerm]);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
