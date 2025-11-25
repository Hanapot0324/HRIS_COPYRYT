const express = require('express');
const router = express.Router();
const db = require('../db');

// POST: Add PhilHealth contribution
router.post('/api/philhealth', (req, res) => {
  const { employeeNumber, PhilHealthContribution } = req.body;

  const query =
    'INSERT INTO philhealth (employeeNumber, PhilHealthContribution) VALUES (?, ?)';
  db.query(query, [employeeNumber, PhilHealthContribution], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res
      .status(201)
      .json({ message: 'PhilHealth contribution added successfully' });
  });
});

// GET: Get all PhilHealth contributions
router.get('/api/philhealth', (req, res) => {
  db.query('SELECT * FROM philhealth', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// PUT: Update PhilHealth contribution
router.put('/api/philhealth/:id', (req, res) => {
  const { id } = req.params;
  const { employeeNumber, PhilHealthContribution } = req.body;

  const query =
    'UPDATE philhealth SET employeeNumber = ?, PhilHealthContribution = ? WHERE id = ?';
  db.query(
    query,
    [employeeNumber, PhilHealthContribution, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Contribution not found' });
      }
      res.json({ message: 'PhilHealth contribution updated successfully' });
    }
  );
});

// DELETE: Delete PhilHealth contribution
router.delete('/api/philhealth/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM philhealth WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Contribution not found' });
    }
    res.json({ message: 'PhilHealth contribution deleted successfully' });
  });
});

module.exports = router;




