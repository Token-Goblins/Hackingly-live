// Verhoeff algorithm implementation for Aadhaar 12-digit checksum validation
// Official algorithm mandated by UIDAI (Unique Identification Authority of India)

const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

function validateVerhoeff(numStr) {
  const clean = numStr.replace(/\D/g, '');
  if (!clean || clean.length < 2) return false;

  let c = 0;
  const reversed = clean.split('').reverse().map(Number);

  for (let i = 0; i < reversed.length; i++) {
    c = d[c][p[i % 8][reversed[i]]];
  }

  return c === 0;
}

function generateVerhoeffCheckDigit(numStr) {
  const clean = numStr.replace(/\D/g, '');
  let c = 0;
  const reversed = clean.split('').reverse().map(Number);

  for (let i = 0; i < reversed.length; i++) {
    c = d[c][p[(i + 1) % 8][reversed[i]]];
  }

  return inv[c];
}

function validateAadhaar(raw) {
  if (!raw) return { valid: false, reason: 'Empty ID number' };
  
  const cleaned = raw.replace(/[\s-]/g, '');
  
  // Check for masked Aadhaar format e.g. XXXX-XXXX-1234
  if (/^[xX*]{8}\d{4}$/.test(cleaned)) {
    return {
      valid: true,
      isMasked: true,
      last4: cleaned.slice(-4),
      formatted: `XXXX-XXXX-${cleaned.slice(-4)}`,
      reason: 'Valid masked Aadhaar format'
    };
  }

  if (!/^\d{12}$/.test(cleaned)) {
    return {
      valid: false,
      reason: 'Aadhaar must be exactly 12 digits (or masked with last 4 digits)'
    };
  }

  // Cannot start with 0 or 1 per UIDAI specifications
  if (cleaned[0] === '0' || cleaned[0] === '1') {
    return {
      valid: false,
      reason: 'Invalid UIDAI prefix (Aadhaar cannot start with 0 or 1)'
    };
  }

  const checksumValid = validateVerhoeff(cleaned);
  return {
    valid: checksumValid,
    isMasked: false,
    formatted: `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)}`,
    last4: cleaned.slice(-4),
    reason: checksumValid ? 'Valid 12-digit Aadhaar with Verhoeff mathematical checksum' : 'Failed Verhoeff checksum algorithm'
  };
}

module.exports = {
  validateVerhoeff,
  generateVerhoeffCheckDigit,
  validateAadhaar
};
