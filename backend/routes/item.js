const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, logAudit } = require('../middleware/auth');

// GET all item table records
router.get('/api/item-table', authenticateToken, (req, res) => {
  const sql = `
    SELECT id, item_description, employeeID, name, item_code, salary_grade, step, effectivityDate, dateCreated
    FROM item_table
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database Query Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      logAudit(req.user, 'View', 'item_table', null, null);
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.json(result);
  });
});

// POST: Add new item
router.post('/api/item-table', authenticateToken, (req, res) => {
  const {
    item_description,
    employeeID,
    name,
    item_code,
    salary_grade,
    step,
    effectivityDate,
  } = req.body;

  const sql = `
    INSERT INTO item_table (item_description, employeeID, name, item_code, salary_grade, step, effectivityDate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [
      item_description,
      employeeID,
      name,
      item_code,
      salary_grade,
      step,
      effectivityDate,
    ],
    (err, result) => {
      if (err) {
        console.error('Database Insert Error:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      try {
        logAudit(req.user, 'Insert', 'item_table', result.insertId, employeeID);
      } catch (e) {
        console.error('Audit log error:', e);
      }

      res.json({
        message: 'Item record added successfully',
        id: result.insertId,
      });
    }
  );
});

// PUT: Update item
router.put('/api/item-table/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    item_description,
    employeeID,
    name,
    item_code,
    salary_grade,
    step,
    effectivityDate,
  } = req.body;

  const sql = `
    UPDATE item_table SET
      item_description = ?,
      employeeID = ?,
      name = ?,
      item_code = ?,
      salary_grade = ?,
      step = ?,
      effectivityDate = ?
   
    WHERE id = ?
  `;
  db.query(
    sql,
    [
      item_description,
      employeeID,
      name,
      item_code,
      salary_grade,
      step,
      effectivityDate,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error('Database Update Error:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      try {
        logAudit(req.user, 'Update', 'item_table', id, employeeID);
      } catch (e) {
        console.error('Audit log error:', e);
      }

      res.json({ message: 'Item record updated successfully' });
    }
  );
});

// DELETE: Delete item
router.delete('/api/item-table/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM item_table WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Database Delete Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    try {
      logAudit(req.user, 'Delete', 'item_table', id, null);
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.json({ message: 'Item record deleted successfully' });
  });
});

module.exports = router;




