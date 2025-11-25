const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/email');
const { twoFACodes } = require('../utils/verificationCodes');

// LOGIN
router.post('/login', (req, res) => {
  const { employeeNumber, password } = req.body;

  const query = `
    SELECT u.*, 
           p.firstName, 
           p.middleName, 
           p.lastName, 
           p.nameExtension,
           CONCAT(p.firstName, 
                  CASE WHEN p.middleName IS NOT NULL THEN CONCAT(' ', p.middleName) ELSE '' END,
                  ' ', p.lastName,
                  CASE WHEN p.nameExtension IS NOT NULL THEN CONCAT(' ', p.nameExtension) ELSE '' END
           ) as fullName
    FROM users u 
    LEFT JOIN person_table p ON u.employeeNumber = p.agencyEmployeeNum 
    WHERE u.employeeNumber = ?
  `;

  db.query(query, [employeeNumber], async (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0)
      return res.status(400).send({ message: 'User not found' });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).send({ message: 'Invalid credentials' });

    res.status(200).send({
      email: user.email,
      employeeNumber: user.employeeNumber,
      fullName: user.fullName,
    });
  });
});

// Send 2FA code
router.post('/send-2fa-code', async (req, res) => {
  const { email, employeeNumber } = req.body;
  if (!email || !employeeNumber) {
    return res
      .status(400)
      .json({ error: 'Email and employee number required' });
  }

  // Check if MFA is enabled for this user
  db.query(
    'SELECT enable_mfa FROM user_preferences WHERE employee_number = ?',
    [employeeNumber],
    async (err, prefResult) => {
      if (err) {
        console.error('Error checking MFA preference:', err);
        // Continue with default (enabled) if error
      } else {
        // If MFA is disabled, return error
        if (prefResult.length > 0 && (prefResult[0].enable_mfa === 0 || prefResult[0].enable_mfa === false)) {
          return res.status(400).json({ error: 'MFA is disabled for this account' });
        }
      }

      const query = `
        SELECT p.firstName, 
               p.middleName, 
               p.lastName, 
               p.nameExtension,
               CONCAT(p.firstName, 
                      CASE WHEN p.middleName IS NOT NULL THEN CONCAT(' ', p.middleName) ELSE '' END,
                      ' ', p.lastName,
                      CASE WHEN p.nameExtension IS NOT NULL THEN CONCAT(' ', p.nameExtension) ELSE '' END
               ) as fullName
        FROM users u 
        LEFT JOIN person_table p ON u.employeeNumber = p.agencyEmployeeNum 
        WHERE u.email = ? AND u.employeeNumber = ?
      `;

      db.query(query, [email, employeeNumber], async (err, result) => {
        if (err) {
          console.error('DB error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (result.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        const user = result[0];
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000;

        twoFACodes[email] = { code, expiresAt };

        try {
          await transporter.sendMail({
        from: '"EARIST HR Testing" <yourgmail@gmail.com>',
        to: email,
        subject: 'Login Verification Code',
        html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #8b3a3a 0%, #6d2323 100%); color: #ffffff; text-align: center; padding: 20px 20px;">
            <p style="margin: 0; font-size: 15px; opacity: 0.95; font-weight: 300;">Login Verification</p>
          </div>
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <p style="color: #333333; margin: 0 0 12px 0; font-size: 16px;">Hello <strong>${user.fullName}</strong>,</p>
            <p style="color: #555555; margin: 0 0 25px 0; font-size: 15px; line-height: 1.6;">We detected a login attempt to your account. For your security, please verify your identity by entering the verification code below:</p>
            <div style="background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%); padding: 30px; text-align: center; margin: 30px 0; border-radius: 10px; border: 2px dashed #d0d0d0;">
              <p style="color: #888888; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Your Verification Code</p>
              <h1 style="color: #000000; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: 700; text-decoration: none;">${code}</h1>
            </div>
            <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 25px 0; border-radius: 5px;">
              <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">⏱️ This code will expire in <strong>15 minutes</strong>. Do not share it with anyone.</p>
            </div>
            <p style="color: #555555; margin: 0; font-size: 14px; line-height: 1.6;">If this login attempt wasn't made by you, we recommend securing your account immediately.</p>
          </div>
        </div>
        <div style="text-align: center; padding: 15px 0; color: #999999; font-size: 12px;">
          <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `,
      });
          res.json({ message: 'Verification code sent' });
        } catch (err) {
          console.error('Email send error:', err);
          res.status(500).json({ error: 'Failed to send email' });
        }
      });
    }
  );
});

// Verify 2FA code
router.post('/verify-2fa-code', (req, res) => {
  const { email, code } = req.body;
  const record = twoFACodes[email];

  if (!record) {
    return res
      .status(400)
      .json({ error: 'No code found. Please request again.' });
  }

  if (Date.now() > record.expiresAt) {
    delete twoFACodes[email];
    return res
      .status(400)
      .json({ error: 'Code expired. Please request a new one.' });
  }

  if (record.code !== code) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  res.json({ verified: true });
});

// Complete 2FA login
router.post('/complete-2fa-login', (req, res) => {
  const { email, employeeNumber } = req.body;

  const query = `
    SELECT u.*,
           p.firstName,
           p.middleName,
           p.lastName,
           p.nameExtension,
           CONCAT(p.firstName,
                  CASE WHEN p.middleName IS NOT NULL THEN CONCAT(' ', p.middleName) ELSE '' END,
                  ' ', p.lastName,
                  CASE WHEN p.nameExtension IS NOT NULL THEN CONCAT(' ', p.nameExtension) ELSE '' END
           ) as fullName
    FROM users u
    LEFT JOIN person_table p ON u.employeeNumber = p.agencyEmployeeNum
    WHERE u.email = ? OR u.employeeNumber = ?
  `;

  db.query(query, [email, employeeNumber], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result[0];
    delete twoFACodes[email];

    const isDefaultPassword = user.isDefaultPassword === 1 || user.isDefaultPassword === true;

    const token = jwt.sign(
      {
        id: user.id,
        username: user.fullName,
        employeeNumber: user.employeeNumber,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        nameExtension: user.nameExtension,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '10h' }
    );

    res.json({
      token,
      role: user.role,
      employeeNumber: user.employeeNumber,
      email: user.email,
      username: user.fullName,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      nameExtension: user.nameExtension,
      isDefaultPassword: isDefaultPassword,
    });
  });
});

module.exports = router;




