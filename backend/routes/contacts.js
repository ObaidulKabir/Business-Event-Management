const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all contacts
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM contacts';
    const params = [];

    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }

    sql += ' ORDER BY name ASC';

    const contacts = await db.all(sql, params);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single contact by ID
router.get('/:id', async (req, res) => {
  try {
    const contact = await db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id]);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Get events related to this contact
    const events = await db.all(`
      SELECT e.*, cat.name as category_name, cat.color as category_color
      FROM events e
      LEFT JOIN categories cat ON e.category_id = cat.id
      WHERE e.contact_id = ?
      ORDER BY e.event_date DESC
    `, [req.params.id]);

    res.json({ ...contact, events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new contact
router.post('/', async (req, res) => {
  try {
    const { name, type, email, phone, company, notes } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const result = await db.run(
      `INSERT INTO contacts (name, type, email, phone, company, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, type, email, phone, company, notes]
    );

    res.status(201).json({ id: result.id, message: 'Contact created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update contact
router.put('/:id', async (req, res) => {
  try {
    const { name, type, email, phone, company, notes } = req.body;

    const result = await db.run(
      `UPDATE contacts 
       SET name = ?, type = ?, email = ?, phone = ?, company = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, type, email, phone, company, notes, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE contact
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM contacts WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
