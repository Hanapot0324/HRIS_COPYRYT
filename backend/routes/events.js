const express = require('express');
const router = express.Router();
const db = require('../db');

// GET events by employee number
router.get('/api/events/:employeeNumber', async (req, res) => {
  try {
    const { employeeNumber } = req.params;
    const [rows] = await db.promise().query(
      'SELECT * FROM events WHERE employee_number = ? ORDER BY created_at DESC',
      [employeeNumber]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// POST: Create event
router.post('/api/events', async (req, res) => {
  try {
    const { employee_number, date, title, description } = req.body;
    const [result] = await db.promise().query(
      'INSERT INTO events (employee_number, date, title, description) VALUES (?, ?, ?, ?)',
      [employee_number, date, title, description]
    );

    const [newEvent] = await db.promise().query('SELECT * FROM events WHERE id = ?', [
      result.insertId,
    ]);

    res.json(newEvent[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
});

// DELETE: Delete event
router.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

module.exports = router;




