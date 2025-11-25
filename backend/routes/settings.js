const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const fs = require('fs');
const { upload } = require('../middleware/upload');

// ============================================
// SYSTEM SETTINGS ROUTES
// ============================================

// GET all system settings
router.get('/api/system-settings', (req, res) => {
  console.log('GET /api/system-settings called');

  // Check if table exists first
  db.query("SHOW TABLES LIKE 'system_settings'", (err, tables) => {
    if (err) {
      console.error('Error checking table:', err);
      return res.status(500).json({
        error: 'Database error',
        details: err.message,
      });
    }

    if (tables.length === 0) {
      console.error('system_settings table does not exist');
      return res.status(500).json({
        error: 'Database table not found. Please run the SQL setup script.',
      });
    }

    // Fetch all settings
    db.query('SELECT * FROM system_settings', (err, rows) => {
      if (err) {
        console.error('Error fetching system settings:', err);
        return res.status(500).json({
          error: 'Failed to fetch system settings',
          details: err.message,
        });
      }

      console.log('Fetched rows:', rows);

      // If no settings exist, return defaults
      if (rows.length === 0) {
        console.log('No settings found, returning defaults');
        return res.json({
          primaryColor: '#894444',
          secondaryColor: '#6d2323',
          accentColor: '#FEF9E1',
          textColor: '#FFFFFF',
          textPrimaryColor: '#6D2323', // Added textPrimaryColor
          textSecondaryColor: '#FEF9E1', // Added textSecondaryColor
          hoverColor: '#6D2323',
          backgroundColor: '#FFFFFF',
          institutionLogo: '',
          hrisLogo: '',
          institutionName:
            'Eulogio "Amang" Rodriguez Institute of Science and Technology',
          systemName: 'Human Resources Information System',
          institutionAbbreviation: 'EARIST',
          footerText:
            '© 2025 EARIST Manila - Human Resources Information System. All rights Reserved.',
          copyrightSymbol: '©', // Added copyrightSymbol
          enableWatermark: true,
        });
      }

      // Convert array of settings to object format
      const settings = {};
      rows.forEach((row) => {
        if (row.setting_key === 'enableWatermark') {
          settings[row.setting_key] = row.setting_value === 'true';
        } else {
          settings[row.setting_key] = row.setting_value;
        }
      });

      console.log('Returning settings:', settings);
      res.json(settings);
    });
  });
});

// GET single setting by key
router.get('/api/system-settings/:key', (req, res) => {
  const { key } = req.params;

  db.query(
    'SELECT * FROM system_settings WHERE setting_key = ?',
    [key],
    (err, rows) => {
      if (err) {
        console.error('Error fetching setting:', err);
        return res.status(500).json({
          error: 'Failed to fetch setting',
          details: err.message,
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Setting not found' });
      }

      res.json(rows[0]);
    }
  );
});

// UPDATE system settings (bulk update)
router.put('/api/system-settings', (req, res) => {
  console.log('PUT /api/system-settings called');
  console.log('Request body:', req.body);

  const settings = req.body;

  if (!settings || Object.keys(settings).length === 0) {
    return res.status(400).json({ error: 'No settings provided' });
  }

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).json({
        error: 'Database connection error',
        details: err.message,
      });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error('Error starting transaction:', err);
        return res.status(500).json({
          error: 'Transaction error',
          details: err.message,
        });
      }

      const entries = Object.entries(settings);
      let completed = 0;
      let hasError = false;

      if (entries.length === 0) {
        connection.release();
        return res.status(400).json({ error: 'No settings to update' });
      }

      entries.forEach(([key, value]) => {
        if (hasError) return;

        const settingValue =
          typeof value === 'boolean' ? value.toString() : value;

        console.log(`Updating ${key} = ${settingValue}`);

        connection.query(
          `INSERT INTO system_settings (setting_key, setting_value) 
           VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE setting_value = ?`,
          [key, settingValue, settingValue],
          (err) => {
            if (err && !hasError) {
              hasError = true;
              console.error('Error updating setting:', err);
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({
                  error: 'Failed to update settings',
                  details: err.message,
                });
              });
            }

            completed++;

            if (completed === entries.length && !hasError) {
              connection.commit((err) => {
                if (err) {
                  console.error('Error committing transaction:', err);
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                      error: 'Failed to commit changes',
                      details: err.message,
                    });
                  });
                }

                connection.release();
                console.log('Settings updated successfully');
                res.json({
                  success: true,
                  message: 'Settings updated successfully',
                });
              });
            }
          }
        );
      });
    });
  });
});

// UPDATE single setting
router.put('/api/system-settings/:key', (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  const settingValue = typeof value === 'boolean' ? value.toString() : value;

  db.query(
    `INSERT INTO system_settings (setting_key, setting_value) 
     VALUES (?, ?) 
     ON DUPLICATE KEY UPDATE setting_value = ?`,
    [key, settingValue, settingValue],
    (err) => {
      if (err) {
        console.error('Error updating setting:', err);
        return res.status(500).json({
          error: 'Failed to update setting',
          details: err.message,
        });
      }

      res.json({
        success: true,
        message: 'Setting updated successfully',
      });
    }
  );
});

// DELETE setting
router.delete('/api/system-settings/:key', (req, res) => {
  const { key } = req.params;

  db.query(
    'DELETE FROM system_settings WHERE setting_key = ?',
    [key],
    (err) => {
      if (err) {
        console.error('Error deleting setting:', err);
        return res.status(500).json({
          error: 'Failed to delete setting',
          details: err.message,
        });
      }

      res.json({
        success: true,
        message: 'Setting deleted successfully',
      });
    }
  );
});

// RESET to default settings
router.post('/api/system-settings/reset', (req, res) => {
  console.log('POST /api/system-settings/reset called');

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).json({
        error: 'Database connection error',
        details: err.message,
      });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({
          error: 'Transaction error',
          details: err.message,
        });
      }

      // Delete all existing settings
      connection.query('DELETE FROM system_settings', (err) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            console.error('Error deleting settings:', err);
            res.status(500).json({
              error: 'Failed to delete settings',
              details: err.message,
            });
          });
        }

        console.log('Deleted all existing settings');

        // Insert default values
        const defaultSettings = [
          ['primaryColor', '#894444'],
          ['secondaryColor', '#6d2323'],
          ['accentColor', '#FEF9E1'],
          ['textColor', '#FFFFFF'],
          ['textPrimaryColor', '#6D2323'], // Added textPrimaryColor
          ['textSecondaryColor', '#FEF9E1'], // Added textSecondaryColor
          ['hoverColor', '#6D2323'],
          ['backgroundColor', '#FFFFFF'],
          ['institutionLogo', ''],
          ['hrisLogo', ''],
          [
            'institutionName',
            'Eulogio "Amang" Rodriguez Institute of Science and Technology',
          ],
          ['systemName', 'Human Resources Information System'],
          ['institutionAbbreviation', 'EARIST'],
          [
            'footerText',
            '© 2025 EARIST Manila - Human Resources Information System. All rights Reserved.',
          ],
          ['copyrightSymbol', '©'], // Added copyrightSymbol
          ['enableWatermark', 'true'],
        ];

        let completed = 0;
        let hasError = false;

        defaultSettings.forEach(([key, value]) => {
          if (hasError) return;

          connection.query(
            'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)',
            [key, value],
            (err) => {
              if (err && !hasError) {
                hasError = true;
                return connection.rollback(() => {
                  connection.release();
                  console.error('Error inserting default setting:', err);
                  res.status(500).json({
                    error: 'Failed to insert default settings',
                    details: err.message,
                  });
                });
              }

              completed++;

              if (completed === defaultSettings.length && !hasError) {
                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      console.error('Error committing transaction:', err);
                      res.status(500).json({
                        error: 'Failed to commit changes',
                        details: err.message,
                      });
                    });
                  }

                  connection.release();
                  console.log('Settings reset successfully');
                  res.json({
                    success: true,
                    message: 'Settings reset to default successfully',
                  });
                });
              }
            }
          );
        });
      });
    });
  });
});

// ============================================
// SETTINGS ROUTES (legacy settings table)
// ============================================

// GET settings
router.get('/api/settings', (req, res) => {
  db.query('SELECT * FROM settings WHERE id = 1', (err, result) => {
    if (err) throw err;
    res.send(result[0]);
  });
});

// Helper function to delete old logo
const deleteOldLogo = (logoUrl) => {
  if (!logoUrl) return; // If no logo URL, exit early

  const logoPath = path.join(__dirname, logoUrl); // Construct the full path to the logo file
  fs.unlink(logoPath, (err) => {
    if (err) {
      console.error(`Error deleting old logo at ${logoPath}: ${err}`);
    } else {
      console.log(`Previous logo at ${logoPath} deleted successfully.`);
    }
  });
};

// Update settings
router.post('/api/settings', upload.single('logo'), (req, res) => {
  const companyName = req.body.company_name || '';
  const headerColor = req.body.header_color || '#ffffff';
  const footerText = req.body.footer_text || '';
  const footerColor = req.body.footer_color || '#ffffff';
  const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Check if settings already exist
  db.query('SELECT * FROM settings WHERE id = 1', (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      // Existing settings found

      const oldLogoUrl = result[0].logo_url; // Save old logo URL for deletion

      // Update existing settings
      const query =
        'UPDATE settings SET company_name = ?, header_color = ?, footer_text = ?, footer_color = ?' +
        (logoUrl ? ', logo_url = ?' : '') +
        ' WHERE id = 1';
      const params = [companyName, headerColor, footerText, footerColor];
      if (logoUrl) params.push(logoUrl);

      db.query(query, params, (err) => {
        if (err) throw err;

        // If there's a new logo, delete the old one
        if (logoUrl && oldLogoUrl) {
          deleteOldLogo(oldLogoUrl);
        }

        res.send({ success: true });
      });
    } else {
      // Insert new settings
      const query =
        'INSERT INTO settings (company_name, header_color, footer_text, footer_color, logo_url) VALUES (?, ?, ?, ?, ?)';
      db.query(
        query,
        [companyName, headerColor, footerText, footerColor, logoUrl],
        (err) => {
          if (err) throw err;
          res.send({ success: true });
        }
      );
    }
  });
});

module.exports = router;




