const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, logAudit } = require('../middleware/auth');

// GET audit logs
router.get('/audit-logs', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM audit_log ORDER BY timestamp DESC';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching audit logs:', err);
      return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }

    try {
      logAudit(req.user, 'View', 'audit_log', null, null);
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.json(result);
  });
});

module.exports = router;




