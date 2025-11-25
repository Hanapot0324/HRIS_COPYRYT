// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map();
const twoFACodes = {};

// Generate random 6-digit code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  verificationCodes,
  twoFACodes,
  generateVerificationCode,
};




