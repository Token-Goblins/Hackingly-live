// Deduplication & Sybil Attack Detection Service
const crypto = require('crypto');

class DedupService {
  constructor() {
    // In-memory registration registry indexed by ID number and image hash
    this.registrations = [];
    this.idIndex = new Map(); // idNumber -> list of registrations
    this.imageHashIndex = new Map(); // hash -> registration

    this.seedInitialData();
  }

  seedInitialData() {
    // Seed initial historical registrations so organizers immediately see live graphs & duplicate alerts
    const seeds = [
      {
        id: 'REG-1001',
        name: 'Rohan Gupta',
        email: 'rohan.gupta@gmail.com',
        college: 'National Institute of Technology',
        docType: 'AADHAAR',
        idNumber: '5489 1234 9876',
        dob: '15-08-2003',
        age: 23,
        status: 'VERIFIED',
        trustScore: 95,
        decisionReason: 'Verified genuine document, age 23 eligible for AI Build Challenge.',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        imageHash: 'hash_rohan_5489'
      },
      {
        id: 'REG-1002',
        name: 'Aarav Sharma',
        email: 'aarav.s@outlook.com',
        college: 'Premier Institute of Science',
        docType: 'COLLEGE_ID',
        idNumber: 'TECH2023CS019',
        dob: '22-11-2004',
        age: 21,
        status: 'VERIFIED',
        trustScore: 92,
        decisionReason: 'Verified college ID card. Valid through 2027 batch.',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        imageHash: 'hash_aarav_tech'
      },
      {
        id: 'REG-1003',
        name: 'Pooja Verma',
        email: 'pooja.verma@tech.edu',
        college: 'Apex Technological University',
        docType: 'PAN',
        idNumber: 'ABCDE1234F',
        dob: '05-03-2002',
        age: 24,
        status: 'VERIFIED',
        trustScore: 96,
        decisionReason: 'Verified PAN card with valid 4th char Individual identity.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        imageHash: 'hash_pooja_pan'
      }
    ];

    seeds.forEach(s => this.register(s));
  }

  computeImageHash(imageStr) {
    if (!imageStr) return null;
    return crypto.createHash('sha256').update(imageStr).digest('hex').slice(0, 16);
  }

  normalizeIdNumber(idNumber) {
    if (!idNumber) return '';
    return idNumber.replace(/[\s-]/g, '').toUpperCase();
  }

  checkDuplicate({ idNumber, applicantName, imageStr = null, registrationId = null }) {
    const cleanId = this.normalizeIdNumber(idNumber);
    const flags = [];
    let isDuplicate = false;
    let isSybilAttack = false; // Same ID registered under DIFFERENT applicant name!
    let existingRecord = null;

    // 1. Check ID Number Reuse
    if (cleanId && this.idIndex.has(cleanId)) {
      const pastRegistrations = this.idIndex.get(cleanId);
      // Filter out if it's the exact same registration ID being re-evaluated
      const conflicting = pastRegistrations.filter(r => r.id !== registrationId);

      if (conflicting.length > 0) {
        existingRecord = conflicting[0];
        isDuplicate = true;

        const normalizedPastName = existingRecord.name.trim().toLowerCase();
        const normalizedCurrentName = (applicantName || '').trim().toLowerCase();

        // Check name similarity
        if (normalizedPastName !== normalizedCurrentName) {
          isSybilAttack = true;
          flags.push({
            type: 'SYBIL_ID_REUSE_DIFFERENT_NAME',
            severity: 'CRITICAL',
            message: `CRITICAL FRAUD: The ID number (${idNumber}) was already registered under a completely different name ("${existingRecord.name}"). Attempted registration under "${applicantName}".`,
            conflictingRegistrationId: existingRecord.id,
            originalApplicantName: existingRecord.name,
            timestamp: existingRecord.timestamp
          });
        } else {
          flags.push({
            type: 'DUPLICATE_REGISTRATION',
            severity: 'HIGH',
            message: `The ID number (${idNumber}) has already been registered for this event by "${existingRecord.name}" (ID: ${existingRecord.id}).`,
            conflictingRegistrationId: existingRecord.id,
            timestamp: existingRecord.timestamp
          });
        }
      }
    }

    // 2. Check Image Hash Reuse
    if (imageStr) {
      const hash = this.computeImageHash(imageStr);
      if (hash && this.imageHashIndex.has(hash)) {
        const matchingDoc = this.imageHashIndex.get(hash);
        if (matchingDoc.id !== registrationId) {
          flags.push({
            type: 'EXACT_IMAGE_FILE_REUSED',
            severity: 'HIGH',
            message: `Perceptual image hash collision detected: The uploaded document image is identical to registration ${matchingDoc.id} submitted by "${matchingDoc.name}".`,
            conflictingRegistrationId: matchingDoc.id
          });
        }
      }
    }

    return {
      isDuplicate,
      isSybilAttack,
      flags,
      existingRecord
    };
  }

  register(record) {
    this.registrations.unshift(record);

    const cleanId = this.normalizeIdNumber(record.idNumber);
    if (cleanId) {
      if (!this.idIndex.has(cleanId)) {
        this.idIndex.set(cleanId, []);
      }
      this.idIndex.get(cleanId).push(record);
    }

    if (record.imageHash) {
      this.imageHashIndex.set(record.imageHash, record);
    }

    return record;
  }

  updateRegistrationStatus(id, newStatus, reason = null) {
    const record = this.registrations.find(r => r.id === id);
    if (record) {
      record.status = newStatus;
      if (reason) record.decisionReason = reason;
      record.updatedAt = new Date().toISOString();
      return record;
    }
    return null;
  }

  getAllRegistrations() {
    return this.registrations;
  }

  getRegistrationById(id) {
    return this.registrations.find(r => r.id === id) || null;
  }

  getStats() {
    const total = this.registrations.length;
    const verified = this.registrations.filter(r => r.status === 'VERIFIED').length;
    const reviewQueue = this.registrations.filter(r => r.status === 'REVIEW_NEEDED').length;
    const rejected = this.registrations.filter(r => r.status === 'REJECTED').length;
    const sybilBlocked = this.registrations.filter(r => r.isSybilAttack).length;

    return {
      total,
      verified,
      reviewQueue,
      rejected,
      sybilBlocked,
      autoVerificationRate: total > 0 ? Math.round((verified / total) * 100) : 0
    };
  }
}

const dedupService = new DedupService();
module.exports = dedupService;
