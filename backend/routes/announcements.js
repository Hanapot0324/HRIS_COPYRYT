const express = require('express');
const router = express.Router();
const db = require('../db');
const { upload } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// GET all announcements
router.get('/api/announcements', (req, res) => {
  const query = 'SELECT * FROM announcements ORDER BY date DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching announcements:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// POST: Create announcement
router.post('/api/announcements', upload.single('image'), (req, res) => {
  const { title, about, date } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const query =
    'INSERT INTO announcements (title, about, date, image) VALUES (?, ?, ?, ?)';
  db.query(query, [title, about, date, image], (err, result) => {
    if (err) {
      console.error('Error creating announcement:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Create notifications for all employees
    const announcementId = result.insertId;
    const notificationDescription = `New announcement has been posted. Click to see details.`;
    
    // Fetch all employee numbers from users table and create notifications
    db.query(
      'SELECT DISTINCT employeeNumber FROM users WHERE employeeNumber IS NOT NULL AND employeeNumber != ""',
      async (userErr, users) => {
        if (userErr) {
          console.error('Error fetching users for notifications:', userErr);
          // Still return success even if notification creation fails
          return res.status(201).json({
            message: 'Announcement created successfully',
            id: announcementId,
          });
        }

        if (users && users.length > 0) {
          // Create notifications for each employee using promises
          const notificationPromises = users.map((user) => {
            return new Promise((resolve) => {
              const empNum = String(user.employeeNumber).trim();
              if (!empNum) {
                resolve({ success: false, reason: 'empty employee number' });
                return;
              }

              // Try with notification_type, action_link, and announcement_id first
              db.query(
                `INSERT INTO notifications (employeeNumber, description, read_status, notification_type, action_link, announcement_id) 
                 VALUES (?, ?, 0, 'announcement', NULL, ?)`,
                [empNum, notificationDescription, announcementId],
                (notifErr) => {
                  if (notifErr) {
                    // Fallback: try without announcement_id
                    db.query(
                      `INSERT INTO notifications (employeeNumber, description, read_status, notification_type, action_link) 
                       VALUES (?, ?, 0, 'announcement', NULL)`,
                      [empNum, notificationDescription],
                      (fallbackErr) => {
                        if (fallbackErr) {
                          // Final fallback: try without notification_type and action_link
                          db.query(
                            `INSERT INTO notifications (employeeNumber, description, read_status) 
                             VALUES (?, ?, 0)`,
                            [empNum, notificationDescription],
                            (finalErr) => {
                              if (finalErr) {
                                console.error(`Error creating notification for employee ${empNum}:`, finalErr);
                                resolve({ success: false, employeeNumber: empNum });
                              } else {
                                resolve({ success: true, employeeNumber: empNum });
                              }
                            }
                          );
                        } else {
                          resolve({ success: true, employeeNumber: empNum });
                        }
                      }
                    );
                  } else {
                    resolve({ success: true, employeeNumber: empNum });
                  }
                }
              );
            });
          });

          // Wait for all notifications to be created (but don't block the response)
          Promise.all(notificationPromises).then((results) => {
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            console.log(`Created ${successful} announcement notifications${failed > 0 ? ` (${failed} failed)` : ''}`);
          }).catch((err) => {
            console.error('Error processing notification promises:', err);
          });
        }

        res.status(201).json({
          message: 'Announcement created successfully',
          id: announcementId,
        });
      }
    );
  });
});

// PUT: Update announcement
router.put('/api/announcements/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { title, about, date } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  // Build query dynamically if image is updated
  let query, params;
  if (image) {
    query =
      'UPDATE announcements SET title = ?, about = ?, date = ?, image = ? WHERE id = ?';
    params = [title, about, date, image, id];
  } else {
    query =
      'UPDATE announcements SET title = ?, about = ?, date = ? WHERE id = ?';
    params = [title, about, date, id];
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating announcement:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json({ message: 'Announcement updated successfully' });
  });
});

// DELETE: Delete announcement
router.delete('/api/announcements/:id', (req, res) => {
  const { id } = req.params;

  // First get the announcement to check if it has an image
  const getQuery = 'SELECT image FROM announcements WHERE id = ?';
  db.query(getQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // If there's an image, delete it from the filesystem
    if (results[0].image) {
      const imagePath = path.join(__dirname, '..', results[0].image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image:', err);
      });
    }

    // Delete the announcement from the database
    const deleteQuery = 'DELETE FROM announcements WHERE id = ?';
    db.query(deleteQuery, [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ message: 'Announcement deleted successfully' });
    });
  });
});

module.exports = router;




