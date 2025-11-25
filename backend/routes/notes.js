const express = require('express');
const router = express.Router();
const db = require('../db');

// GET notes by employee number
router.get('/api/notes/:employeeNumber', async (req, res) => {
  try {
    const { employeeNumber } = req.params;
    const [rows] = await db.promise().query(
      'SELECT * FROM notes WHERE employee_number = ? ORDER BY created_at DESC',
      [employeeNumber]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// POST: Create note
router.post('/api/notes', async (req, res) => {
  try {
    const { employee_number, date, content } = req.body;
    const [result] = await db.promise().query(
      'INSERT INTO notes (employee_number, date, content) VALUES (?, ?, ?)',
      [employee_number, date, content]
    );

    const [newNote] = await db.promise().query('SELECT * FROM notes WHERE id = ?', [
      result.insertId,
    ]);

    res.json(newNote[0]);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Error creating note' });
  }
});

// DELETE: Delete note
router.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query('DELETE FROM notes WHERE id = ?', [id]);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note' });
  }
});

module.exports = router;




