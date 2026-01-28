const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await db.all('SELECT * FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [req.params.id]);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new category
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await db.run(
      'INSERT INTO categories (name, description, color) VALUES (?, ?, ?)',
      [name, description, color || '#6B7280']
    );

    res.status(201).json({ id: result.id, message: 'Category created successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PUT update category
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const result = await db.run(
      'UPDATE categories SET name = ?, description = ?, color = ? WHERE id = ?',
      [name, description, color, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM categories WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
