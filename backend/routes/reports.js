const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET summary statistics
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE event_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Total events
    const totalEvents = await db.get(`SELECT COUNT(*) as count FROM events ${dateFilter}`, params);

    // Events by category
    const eventsByCategory = await db.all(`
      SELECT cat.name, cat.color, COUNT(e.id) as count
      FROM categories cat
      LEFT JOIN events e ON cat.id = e.category_id ${dateFilter ? 'AND e.event_date BETWEEN ? AND ?' : ''}
      GROUP BY cat.id, cat.name, cat.color
      ORDER BY count DESC
    `, dateFilter ? params : []);

    // Events by contact type
    const eventsByContactType = await db.all(`
      SELECT c.type, COUNT(e.id) as count
      FROM events e
      LEFT JOIN contacts c ON e.contact_id = c.id
      ${dateFilter}
      GROUP BY c.type
      ORDER BY count DESC
    `, params);

    // Events by platform
    const eventsByPlatform = await db.all(`
      SELECT platform, COUNT(*) as count
      FROM events
      ${dateFilter}
      GROUP BY platform
      ORDER BY count DESC
    `, params);

    // Recent activity
    const recentActivity = await db.all(`
      SELECT e.*, c.name as contact_name, cat.name as category_name, cat.color as category_color
      FROM events e
      LEFT JOIN contacts c ON e.contact_id = c.id
      LEFT JOIN categories cat ON e.category_id = cat.id
      ${dateFilter}
      ORDER BY e.event_date DESC
      LIMIT 10
    `, params);

    res.json({
      totalEvents: totalEvents.count,
      eventsByCategory,
      eventsByContactType,
      eventsByPlatform,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET detailed report
router.get('/detailed', async (req, res) => {
  try {
    const { startDate, endDate, category, contact, platform } = req.query;
    
    let sql = `
      SELECT e.*, c.name as contact_name, c.type as contact_type, 
             cat.name as category_name, cat.color as category_color,
             (SELECT COUNT(*) FROM attachments WHERE event_id = e.id) as attachment_count
      FROM events e
      LEFT JOIN contacts c ON e.contact_id = c.id
      LEFT JOIN categories cat ON e.category_id = cat.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      sql += ' AND e.event_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND e.event_date <= ?';
      params.push(endDate);
    }
    if (category) {
      sql += ' AND e.category_id = ?';
      params.push(category);
    }
    if (contact) {
      sql += ' AND e.contact_id = ?';
      params.push(contact);
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

module.exports = router;
