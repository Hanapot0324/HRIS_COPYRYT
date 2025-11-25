const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all holiday records
router.get('/holiday', (req, res) => {
  const sql = `SELECT * FROM holiday`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database Query Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(result);
  });
});

// POST: Create holiday record
router.post('/holiday', (req, res) => {
  const { description, date, status } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const sql = `INSERT INTO holiday (description, date, status) VALUES (?, ?, ?)`;
  db.query(sql, [description, date, status], (err, result) => {
    if (err) {
      console.error('Database Insert Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.status(201).json({
      message: 'Holiday record added successfully',
      id: result.insertId,
    });
  });
});

// PUT: Update holiday record
router.put('/holiday/:id', (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const { description, date, status } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const sql = `UPDATE holiday SET description = ?, date = ?, status = ? WHERE id = ?`;
  db.query(sql, [description, date, status, id], (err, result) => {
    if (err) {
      console.error('Database Update Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hol record not found' });
    }

    res.json({ message: 'Hol record updated successfully' });
  });
});

// DELETE: Delete holiday record
router.delete('/holiday/:id', (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const sql = `DELETE FROM holiday WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database Delete Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hol record not found' });
    }

    res.json({ message: 'Hol record deleted successfully' });
  });
});

module.exports = router;




