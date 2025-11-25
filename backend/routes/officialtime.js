const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, logAudit } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const xlsx = require('xlsx');
const fs = require('fs');

// GET official time table by employeeID
router.get('/officialtimetable/:employeeID', authenticateToken, (req, res) => {
  const { employeeID } = req.params;
  const { date } = req.query;
  const sql = 'SELECT * FROM officialtime WHERE employeeID = ? ORDER BY id';

  db.query(sql, [employeeID], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      logAudit(req.user, `View`, 'Official Time', null, employeeID);
    } catch (e) {
      console.error('Audit log error:', e);
    }
    if (date) {
      try {
        logAudit(req.user, 'search', 'official-time-table', date, employeeID);
      } catch (e) {
        console.error('Audit log error:', e);
      }
    }
    res.json(results);
  });
});

// POST official time table
router.post('/officialtimetable', authenticateToken, (req, res) => {
  const { employeeID, records } = req.body;

  if (!records || records.length === 0) {
    return res.status(400).json({ message: 'No records to insert or update.' });
  }

  // Prepare values for bulk insert
  const values = records.map((r) => [
    employeeID,
    r.day,
    r.officialTimeIN,
    r.officialBreaktimeIN,
    r.officialBreaktimeOUT,
    r.officialTimeOUT,
    r.officialHonorariumTimeIN,
    r.officialHonorariumTimeOUT,
    r.officialServiceCreditTimeIN,
    r.officialServiceCreditTimeOUT,
    r.officialOverTimeIN,
    r.officialOverTimeOUT,
    r.breaktime,
  ]);

  const sql = `
    INSERT INTO officialtime (
      employeeID,
      day,
      officialTimeIN,
      officialBreaktimeIN,
      officialBreaktimeOUT,
      officialTimeOUT,
      officialHonorariumTimeIN,
      officialHonorariumTimeOUT,
      officialServiceCreditTimeIN,
      officialServiceCreditTimeOUT,
      officialOverTimeIN,
      officialOverTimeOUT,
      breaktime
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE
      officialTimeIN = VALUES(officialTimeIN),
      officialBreaktimeIN = VALUES(officialBreaktimeIN),
      officialBreaktimeOUT = VALUES(officialBreaktimeOUT),
      officialTimeOUT = VALUES(officialTimeOUT),
      officialHonorariumTimeIN = VALUES(officialHonorariumTimeIN),
      officialHonorariumTimeOUT = VALUES(officialHonorariumTimeOUT),
      officialServiceCreditTimeIN = VALUES(officialServiceCreditTimeIN),
      officialServiceCreditTimeOUT = VALUES(officialServiceCreditTimeOUT),
      officialOverTimeIN = VALUES(officialOverTimeIN),
      officialOverTimeOUT = VALUES(officialOverTimeOUT),
      breaktime = VALUES(breaktime)
  `;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error('Error inserting or updating records:', err);
      return res.status(500).json({ error: err.message });
    }
    try {
      logAudit(
        req.user,
        `Insert official time-table for ${employeeID} (${records.length} rows)`,
        'Official Time',
        null,
        employeeID
      );
    } catch (e) {
      console.error('Audit log error:', e);
    }
    res.json({ message: 'Records inserted or updated successfully' });
  });
});

// EXCEL UPLOAD FOR OFFICIAL TIME
router.post(
  '/upload-excel-faculty-official-time',
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: null,
        raw: false,
      });

      if (!sheet.length) {
        return res.status(400).json({ message: 'Excel file is empty.' });
      }

      const cleanedSheet = sheet.map((row) => {
        const normalized = {};
        for (const key in row) {
          const cleanKey = key
            .replace(/\u00A0/g, '')
            .trim()
            .toLowerCase();
          normalized[cleanKey] = row[key];
        }
        return normalized;
      });

      const getField = (r, names) => {
        for (const n of names) {
          if (r[n] != null) return r[n];
        }
        return null;
      };

      let insertedCount = 0;
      let updatedCount = 0;
      const processedRecords = [];

      for (const r of cleanedSheet) {
        const employeeID = getField(r, [
          'employeeid',
          'employeenumber',
          'employee number',
          'employee_id',
        ]);
        const day = getField(r, ['day', 'weekday']);
        const officialTimeIN = getField(r, [
          'officialtimein',
          'time in',
          'timein',
        ]);
        const officialBreaktimeIN = getField(r, [
          'officialbreaktimein',
          'break in',
          'breakin',
        ]);
        const officialBreaktimeOUT = getField(r, [
          'officialbreaktimeout',
          'break out',
          'breakout',
        ]);
        const officialTimeOUT = getField(r, [
          'officialtimeout',
          'time out',
          'timeout',
        ]);
        const officialHonorariumTimeIN = getField(r, [
          'officialhonorariumtimein',
          'honorarium time in',
          'honorariumtimein',
        ]);
        const officialHonorariumTimeOUT = getField(r, [
          'officialhonorariumtimeout',
          'honorarium time out',
          'honorariumtimeout',
        ]);
        const officialServiceCreditTimeIN = getField(r, [
          'officialservicecredittimein',
          'service credit time in',
          'servicecredittimein',
        ]);
        const officialServiceCreditTimeOUT = getField(r, [
          'officialservicecredittimeout',
          'service credit time out',
          'servicecredittimeout',
        ]);
        const officialOverTimeIN = getField(r, [
          'officialovertimein',
          'overtime in',
          'ot in',
          'overtimein',
        ]);
        const officialOverTimeOUT = getField(r, [
          'officialovertimeout',
          'overtime out',
          'ot out',
          'overtimeout',
        ]);

        if (!employeeID || !day) continue;

        // Store the record for return
        const recordData = {
          employeeID,
          day,
          officialTimeIN: officialTimeIN || '00:00:00 AM',
          officialBreaktimeIN: officialBreaktimeIN || '00:00:00 AM',
          officialBreaktimeOUT: officialBreaktimeOUT || '00:00:00 AM',
          officialTimeOUT: officialTimeOUT || '00:00:00 AM',
          officialHonorariumTimeIN: officialHonorariumTimeIN || '00:00:00 AM',
          officialHonorariumTimeOUT: officialHonorariumTimeOUT || '00:00:00 AM',
          officialServiceCreditTimeIN:
            officialServiceCreditTimeIN || '00:00:00 AM',
          officialServiceCreditTimeOUT:
            officialServiceCreditTimeOUT || '00:00:00 AM',
          officialOverTimeIN: officialOverTimeIN || '00:00:00 AM',
          officialOverTimeOUT: officialOverTimeOUT || '00:00:00 AM',
        };
        processedRecords.push(recordData);

        const checkQuery = `SELECT id FROM officialtime WHERE employeeID = ? AND day = ?`;
        const checkValues = [employeeID, day];

        try {
          const [rows] = await db.promise().query(checkQuery, checkValues);

          if (rows.length > 0) {
            const updateQuery = `
            UPDATE officialtime SET
              officialTimeIN = ?,
              officialBreaktimeIN = ?,
              officialBreaktimeOUT = ?,
              officialTimeOUT = ?,
              officialHonorariumTimeIN = ?,
              officialHonorariumTimeOUT = ?,
              officialServiceCreditTimeIN = ?,
              officialServiceCreditTimeOUT = ?,
              officialOverTimeIN = ?,
              officialOverTimeOUT = ?
            WHERE employeeID = ? AND day = ?
          `;

            const updateValues = [
              officialTimeIN,
              officialBreaktimeIN,
              officialBreaktimeOUT,
              officialTimeOUT,
              officialHonorariumTimeIN,
              officialHonorariumTimeOUT,
              officialServiceCreditTimeIN,
              officialServiceCreditTimeOUT,
              officialOverTimeIN,
              officialOverTimeOUT,
              employeeID,
              day,
            ];

            const [result] = await db
              .promise()
              .query(updateQuery, updateValues);
            if (result.affectedRows > 0) updatedCount++;
          } else {
            const insertQuery = `
            INSERT INTO officialtime (
              employeeID, day,
              officialTimeIN,
              officialBreaktimeIN,
              officialBreaktimeOUT,
              officialTimeOUT,
              officialHonorariumTimeIN,
              officialHonorariumTimeOUT,
              officialServiceCreditTimeIN,
              officialServiceCreditTimeOUT,
              officialOverTimeIN,
              officialOverTimeOUT
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

            const insertValues = [
              employeeID,
              day,
              officialTimeIN,
              officialBreaktimeIN,
              officialBreaktimeOUT,
              officialTimeOUT,
              officialHonorariumTimeIN,
              officialHonorariumTimeOUT,
              officialServiceCreditTimeIN,
              officialServiceCreditTimeOUT,
              officialOverTimeIN,
              officialOverTimeOUT,
            ];

            const [result] = await db
              .promise()
              .query(insertQuery, insertValues);
            if (result.affectedRows > 0) insertedCount++;
          }
        } catch (err) {
          console.error(
            `Error processing row for employeeID: ${employeeID}, day: ${day}`,
            err.message
          );
        }
      }

      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });

      res.json({
        message: 'Upload complete.',
        inserted: insertedCount,
        updated: updatedCount,
        records: processedRecords,
      });
    } catch (error) {
      console.error('Error processing Excel file:', error);
      res.status(500).json({ message: 'Error processing Excel file.' });
    }
  }
);

module.exports = router;




