const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all leave records
router.get('/leave', (req, res) => {
  const sql = `SELECT * FROM leave_table`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database Query Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(result);
  });
});

// POST: Create leave record
router.post('/leave', (req, res) => {
  const { leave_code, description, number_hours, status } = req.body;

  if (!leave_code) {
    return res.status(400).json({ error: 'Leave code is required' });
  }

  const sql = `INSERT INTO leave_table (leave_code, description, number_hours, status) VALUES (?,?,?,?)`;
  db.query(
    sql,
    [leave_code, description, number_hours, status],
    (err, result) => {
      if (err) {
        console.error('Database Insert Error:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.status(201).json({
        message: 'Leave record added successfully',
        id: result.insertId,
      });
    }
  );
});

// PUT: Update leave record
router.put('/leave/:id', (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const { leave_code, description, number_hours, status } = req.body;

  if (!leave_code) {
    return res.status(400).json({ error: 'Leave code is required' });
  }

  const sql = `UPDATE leave_table SET leave_code = ?, description = ?, number_hours = ?, status = ? WHERE id = ?`;
  db.query(
    sql,
    [leave_code, description, number_hours, status, id],
    (err, result) => {
      if (err) {
        console.error('Database Update Error:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Leave record not found' });
      }

      res.json({ message: 'Leave record updated successfully' });
    }
  );
});

// DELETE: Delete leave record
router.delete('/leave/:id', (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const sql = `DELETE FROM leave_table WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database Delete Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave record not found' });
    }

    res.json({ message: 'Leave record deleted successfully' });
  });
});

// LEAVE ASSIGNMENT ROUTES

// POST: Create Leave Assignment
router.post('/leave_assignment', (req, res) => {
  const { employeeID, leaveID, noOfLeaves } = req.body;
  const sql =
    'INSERT INTO leave_assignment (employeeID, leaveID, noOfLeaves) VALUES (?, ?, ?)';
  db.query(sql, [employeeID, leaveID, noOfLeaves], (err, result) => {
    if (err) return res.status(500).json(err);
    res
      .status(201)
      .json({ message: 'Leave Assignment Created', id: result.insertId });
  });
});

// GET: Read Leave Assignments
router.get('/leave_assignment', (req, res) => {
  const sql = 'SELECT * FROM leave_assignment';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// PUT: Update Leave Assignment
router.put('/leave_assignment/:id', (req, res) => {
  const { id } = req.params;
  const { employeeID, leaveID, noOfLeaves } = req.body;
  const sql =
    'UPDATE leave_assignment SET employeeID=?, leaveID=?, noOfLeaves=? WHERE id=?';
  db.query(sql, [employeeID, leaveID, noOfLeaves, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Leave Assignment Updated' });
  });
});

// DELETE: Delete Leave Assignment
router.delete('/leave_assignment/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM leave_assignment WHERE id=?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Leave Assignment Deleted' });
  });
});

module.exports = router;




