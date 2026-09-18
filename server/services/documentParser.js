// Multi-document parser for Indian identity cards
const { validateAadhaar } = require('./verhoeff');

// Regex patterns for Indian identity documents
const PATTERNS = {
  aadhaar: /\b\d{4}\s?\d{4}\s?\d{4}\b/,
  maskedAadhaar: /\b[xX*]{4}\s?[xX*]{4}\s?\d{4}\b/,
  pan: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/,
  voterId: /\b[A-Z]{3}[0-9]{7}\b/,
  drivingLicense: /\b[A-Z]{2}[0-9]{2}\s?[0-9]{11}\b/,
  dob: /\b(?:DOB|Date of Birth|D\.O\.B|Year of Birth|Birth|YOB)[\s:]*(\d{2}[/-]\d{2}[/-]\d{4}|\d{4})\b/i,
  genericDate: /\b(\d{2}[/-]\d{2}[/-]\d{4})\b/,
  batchYear: /\b(?:Batch|Valid (?:Upto|Through|Till)|Class of|Session)[\s:]*(\d{4}(?:-\d{2,4})?)\b/i
};

// Known accredited institutions for college ID verification
const KNOWN_INSTITUTIONS = [
  'Institute of Technology',
  'National Institute of Technology',
  'NIT',
  'Premier Institute of Science',
  'Birla Institute of Technology',
  'IIIT',
  'Apex Technological University',
  'Vellore Institute of Technology',
  'VIT',
  'Manipal Institute of Technology',
  'SRM Institute of Science and Technology',
  'National Engineering Academy',
  'Jadavpur University',
  'Anna University',
  'PES University',
  'Thapar Institute of Engineering',
  'Amity University',
  'Christ University',
  'Metropolitan University',
  'Premier University'
];

function detectDocumentType(ocrText) {
  const text = (ocrText || '').toUpperCase();

  if (text.includes('GOVERNMENT OF INDIA') || text.includes('UNIQUE IDENTIFICATION') || text.includes('AADHAAR') || text.includes('MERA AADHAAR') || PATTERNS.aadhaar.test(text) || PATTERNS.maskedAadhaar.test(text)) {
    return 'AADHAAR';
  }
  if (text.includes('INCOME TAX DEPARTMENT') || text.includes('PERMANENT ACCOUNT NUMBER') || PATTERNS.pan.test(text)) {
    return 'PAN';
  }
  if (text.includes('ELECTION COMMISSION') || text.includes('ELECTOR PHOTO IDENTITY') || text.includes('IDENTITY CARD') && PATTERNS.voterId.test(text)) {
    return 'VOTER_ID';
  }
  if (text.includes('DRIVING LICENCE') || text.includes('UNION OF INDIA DRIVING') || text.includes('TRANSPORT DEPARTMENT')) {
    return 'DRIVING_LICENSE';
  }
  if (text.includes('STUDENT') || text.includes('COLLEGE') || text.includes('UNIVERSITY') || text.includes('INSTITUTE') || text.includes('ROLL NO') || text.includes('ENROLLMENT')) {
    return 'COLLEGE_ID';
  }

  return 'UNKNOWN';
}

function parseDocument(ocrText, docTypeHint = null) {
  const text = ocrText || '';
  const detectedType = docTypeHint || detectDocumentType(text);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const result = {
    documentType: detectedType,
    rawText: text,
    fields: {
      name: null,
      dob: null,
      idNumber: null,
      gender: null,
      institution: null,
      validUpto: null,
      rollNo: null
    },
    validation: {
      isValidFormat: false,
      checksumPassed: false,
      confidence: 0,
      notes: []
    }
  };

  // 1. Parse Date of Birth
  const dobMatch = text.match(PATTERNS.dob) || text.match(PATTERNS.genericDate);
  if (dobMatch) {
    const rawDob = dobMatch[1] || dobMatch[0];
    result.fields.dob = normalizeDate(rawDob);
  }

  // 2. Parse Gender
  if (/\b(MALE|FEMALE|TRANSGENDER)\b/i.test(text)) {
    const gMatch = text.match(/\b(MALE|FEMALE|TRANSGENDER)\b/i);
    result.fields.gender = gMatch ? gMatch[1].toUpperCase() : null;
  }

  // 3. Document-specific parsing
  if (detectedType === 'AADHAAR') {
    parseAadhaar(text, lines, result);
  } else if (detectedType === 'PAN') {
    parsePan(text, lines, result);
  } else if (detectedType === 'COLLEGE_ID') {
    parseCollegeId(text, lines, result);
  } else if (detectedType === 'VOTER_ID') {
    parseVoterId(text, lines, result);
  } else if (detectedType === 'DRIVING_LICENSE') {
    parseDrivingLicense(text, lines, result);
  } else {
    // Generic fallback
    extractGenericFields(text, lines, result);
  }

  return result;
}

function normalizeDate(rawDate) {
  if (!rawDate) return null;
  const cleaned = rawDate.replace(/\./g, '-').replace(/\//g, '-').trim();
  
  // Year only
  if (/^\d{4}$/.test(cleaned)) {
    return `01-01-${cleaned}`;
  }

  const parts = cleaned.split('-');
  if (parts.length === 3) {
    let day = parts[0].padStart(2, '0');
    let month = parts[1].padStart(2, '0');
    let year = parts[2];
    
    // If format is YYYY-MM-DD
    if (year.length === 2 && day.length === 4) {
      const temp = day;
      day = year;
      year = temp;
    }
    
    return `${day}-${month}-${year}`;
  }

  return cleaned;
}

function parseAadhaar(text, lines, result) {
  // Extract 12 digit or masked Aadhaar
  const match = text.match(PATTERNS.aadhaar) || text.match(PATTERNS.maskedAadhaar);
  if (match) {
    const rawNum = match[0];
    const aadhaarCheck = validateAadhaar(rawNum);
    result.fields.idNumber = aadhaarCheck.formatted || rawNum;
    result.validation.checksumPassed = aadhaarCheck.valid;
    result.validation.isValidFormat = true;
    result.validation.notes.push(aadhaarCheck.reason);
    result.validation.confidence += aadhaarCheck.valid ? 45 : 20;
  } else {
    result.validation.notes.push('Aadhaar number not clearly detected in document');
  }

  // Name extraction heuristic in Aadhaar: Usually lines above DOB or below Govt header
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase();
    if (upper.includes('GOVERNMENT OF INDIA') || upper.includes('UNIQUE IDENTIFICATION') || upper.includes('DOB') || upper.includes('BIRTH') || upper.includes('GENDER') || upper.includes('MALE') || upper.includes('FEMALE') || upper.includes('PEHCHAN') || upper.includes('ENROLMENT')) {
      continue;
    }
    if (/^[A-Za-z\s.]{3,35}$/.test(line) && !upper.includes('AADHAAR') && !upper.includes('HELP')) {
      result.fields.name = line.trim();
      break;
    }
  }

  if (result.fields.name) result.validation.confidence += 25;
  if (result.fields.dob) result.validation.confidence += 25;
}

function parsePan(text, lines, result) {
  const panMatch = text.match(PATTERNS.pan);
  if (panMatch) {
    const panNum = panMatch[0].toUpperCase();
    result.fields.idNumber = panNum;
    
    // Validate 4th character is 'P' for Individual/Person
    const isIndividual = panNum[3] === 'P';
    result.validation.isValidFormat = true;
    result.validation.checksumPassed = isIndividual;
    result.validation.confidence += isIndividual ? 50 : 25;
    result.validation.notes.push(isIndividual ? 'Valid PAN for Individual (4th char P)' : 'Warning: PAN 4th character is not P (not an individual)');
  }

  // Name is typically the line after "INCOME TAX DEPARTMENT" and before Father's Name
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toUpperCase();
    if (l.includes('INCOME TAX') || l.includes('GOVT') || l.includes('PERMANENT') || l.includes('ACCOUNT')) continue;
    if (/^[A-Z\s]{4,35}$/.test(l) && !l.includes('FATHER') && !l.includes('INDIA')) {
      result.fields.name = lines[i].trim();
      break;
    }
  }

  if (result.fields.name) result.validation.confidence += 25;
  if (result.fields.dob) result.validation.confidence += 25;
}

function parseCollegeId(text, lines, result) {
  // Detect institution
  for (const inst of KNOWN_INSTITUTIONS) {
    if (text.toLowerCase().includes(inst.toLowerCase())) {
      result.fields.institution = inst;
      result.validation.confidence += 30;
      result.validation.notes.push(`Identified accredited institution: ${inst}`);
      break;
    }
  }

  if (!result.fields.institution) {
    // Look for lines containing College/University/Institute
    for (const l of lines) {
      if (/(COLLEGE|UNIVERSITY|INSTITUTE|CAMPUS|ACADEMY)/i.test(l)) {
        result.fields.institution = l.trim();
        result.validation.confidence += 20;
        break;
      }
    }
  }

  // Roll number / Student ID (avoid matching 'Student ID Card')
  const rollMatch = text.match(/(?:Roll\s*(?:No|Number)?|Enrollment(?:\s*(?:No|Number))?|Reg(?:istration)?(?:\s*(?:No|Number))?|Student\s*ID(?!\s*Card))[\s#:]+([A-Z0-9\-\/]{4,16})/i);
  if (rollMatch && rollMatch[1].toUpperCase() !== 'CARD') {
    result.fields.rollNo = rollMatch[1];
    result.fields.idNumber = rollMatch[1];
    result.validation.confidence += 25;
  }

  // Valid upto / batch
  const batchMatch = text.match(PATTERNS.batchYear);
  if (batchMatch) {
    result.fields.validUpto = batchMatch[1];
    result.validation.confidence += 20;
  }

  // Name extraction (stop at line break)
  const nameMatch = text.match(/(?:Name|Student Name)[\s:]*([A-Za-z\s.]+?)(?:\r?\n|$)/i);
  if (nameMatch) {
    result.fields.name = nameMatch[1].trim();
  } else {
    for (const l of lines) {
      if (/^[A-Za-z\s.]{4,30}$/.test(l) && !l.toLowerCase().includes('student') && !l.toLowerCase().includes('identity') && !l.toLowerCase().includes('card')) {
        result.fields.name = l.trim();
        break;
      }
    }
  }

  if (result.fields.name) result.validation.confidence += 25;
  result.validation.isValidFormat = Boolean(result.fields.institution && (result.fields.name || result.fields.idNumber));
}

function parseVoterId(text, lines, result) {
  const match = text.match(PATTERNS.voterId);
  if (match) {
    result.fields.idNumber = match[0];
    result.validation.isValidFormat = true;
    result.validation.checksumPassed = true;
    result.validation.confidence += 50;
  }
  extractGenericFields(text, lines, result);
}

function parseDrivingLicense(text, lines, result) {
  const match = text.match(PATTERNS.drivingLicense);
  if (match) {
    result.fields.idNumber = match[0];
    result.validation.isValidFormat = true;
    result.validation.confidence += 50;
  }
  extractGenericFields(text, lines, result);
}

function extractGenericFields(text, lines, result) {
  for (const l of lines) {
    if (!result.fields.name && /^[A-Z][a-zA-Z\s]{4,30}$/.test(l)) {
      result.fields.name = l.trim();
    }
  }
  result.validation.isValidFormat = Boolean(result.fields.idNumber || result.fields.name);
}

module.exports = {
  detectDocumentType,
  parseDocument,
  normalizeDate,
  KNOWN_INSTITUTIONS
};
