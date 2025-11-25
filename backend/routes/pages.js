const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET ALL PAGES
router.get('/pages', authenticateToken, async (req, res) => {
  const query = `
    SELECT id, page_name, page_description, page_url, page_group
    FROM pages
    ORDER BY page_description ASC
  `;

  try {
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error fetching pages:', err);
        return res.status(500).json({ error: 'Failed to fetch pages' });
      }

      res.status(200).json(result);
    });
  } catch (err) {
    console.error('Error during page fetch:', err);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// CREATE PAGE
router.post('/pages', authenticateToken, async (req, res) => {
  const { page_name, page_description, page_url, page_group } = req.body;

  // Validate required fields
  if (!page_name || !page_description || !page_group) {
    return res.status(400).json({
      error: 'Page name, description, and group are required',
    });
  }

  try {
    const query = `
      INSERT INTO pages (page_name, page_description, page_url, page_group)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      query,
      [page_name, page_description, page_url || null, page_group],
      (err, result) => {
        if (err) {
          console.error('Error creating page:', err);
          return res.status(500).json({ error: 'Failed to create page' });
        }

        res.status(201).json({
          message: 'Page created successfully',
          pageId: result.insertId,
        });
      }
    );
  } catch (err) {
    console.error('Error during page creation:', err);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

// UPDATE PAGE
router.put('/pages/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { page_name, page_description, page_url, page_group } = req.body;

  try {
    const query = `
      UPDATE pages 
      SET page_name = ?, page_description = ?, page_url = ?, page_group = ?
      WHERE id = ?
    `;

    db.query(
      query,
      [page_name, page_description, page_url, page_group, id],
      (err, result) => {
        if (err) {
          console.error('Error updating page:', err);
          return res.status(500).json({ error: 'Failed to update page' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Page not found' });
        }

        res.status(200).json({ message: 'Page updated successfully' });
      }
    );
  } catch (err) {
    console.error('Error during page update:', err);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// DELETE PAGE
router.delete('/pages/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM pages WHERE id = ?';

    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('Error deleting page:', err);
        return res.status(500).json({ error: 'Failed to delete page' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.status(200).json({ message: 'Page deleted successfully' });
    });
  } catch (err) {
    console.error('Error during page deletion:', err);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

// GET USER PAGE ACCESS
router.get('/page_access/:employeeNumber', authenticateToken, async (req, res) => {
  const { employeeNumber } = req.params;

  try {
    const query = `
      SELECT page_id, page_privilege 
      FROM page_access 
      WHERE employeeNumber = ?
    `;

    db.query(query, [employeeNumber], (err, results) => {
      if (err) {
        console.error('Error fetching page access:', err);
        return res.status(500).json({ error: 'Failed to fetch page access' });
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error('Error during page access fetch:', err);
    res.status(500).json({ error: 'Failed to fetch page access' });
  }
});

// CREATE PAGE ACCESS
router.post('/page_access', authenticateToken, async (req, res) => {
  const { employeeNumber, page_id, page_privilege } = req.body;

  // Validate required fields
  if (!employeeNumber || !page_id || !page_privilege) {
    return res.status(400).json({
      error: 'Employee number, page ID, and privilege are required',
    });
  }

  try {
    // Check if record already exists
    const checkQuery = `
      SELECT * FROM page_access 
      WHERE employeeNumber = ? AND page_id = ?
    `;

    db.query(
      checkQuery,
      [employeeNumber, page_id],
      (checkErr, checkResults) => {
        if (checkErr) {
          console.error('Error checking existing page access:', checkErr);
          return res.status(500).json({ error: 'Failed to check page access' });
        }

        if (checkResults.length > 0) {
          return res
            .status(409)
            .json({ error: 'Page access already exists for this user' });
        }

        // Insert new page access
        const insertQuery = `
        INSERT INTO page_access (employeeNumber, page_id, page_privilege)
        VALUES (?, ?, ?)
      `;

        db.query(
          insertQuery,
          [employeeNumber, page_id, page_privilege],
          (insertErr) => {
            if (insertErr) {
              console.error('Error creating page access:', insertErr);
              return res
                .status(500)
                .json({ error: 'Failed to create page access' });
            }
            res
              .status(201)
              .json({ message: 'Page access created successfully' });
          }
        );
      }
    );
  } catch (err) {
    console.error('Error during page access creation:', err);
    res.status(500).json({ error: 'Failed to create page access' });
  }
});

// UPDATE PAGE ACCESS
router.put('/page_access/:employeeNumber/:pageId', authenticateToken, async (req, res) => {
  const { employeeNumber, pageId } = req.params;
  const { page_privilege } = req.body;

  try {
    const query = `
      UPDATE page_access 
      SET page_privilege = ? 
      WHERE employeeNumber = ? AND page_id = ?
    `;

    db.query(query, [page_privilege, employeeNumber, pageId], (err, result) => {
      if (err) {
        console.error('Error updating page access:', err);
        return res.status(500).json({ error: 'Failed to update page access' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Page access record not found' });
      }
      res.status(200).json({ message: 'Page access updated successfully' });
    });
  } catch (err) {
    console.error('Error during page access update:', err);
    res.status(500).json({ error: 'Failed to update page access' });
  }
});

module.exports = router;




