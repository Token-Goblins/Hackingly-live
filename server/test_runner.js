// Automated Test Suite for fintrust.ai Trust Engine (PS-003)
const assert = require('assert');
const { validateAadhaar, validateVerhoeff } = require('./services/verhoeff');
const { parseDocument, detectDocumentType } = require('./services/documentParser');
const { analyzeDocumentForensics } = require('./services/forensicEngine');
const { verifyFaceMatch } = require('./services/faceMatcher');
const dedupService = require('./services/dedupService');
const { evaluateEligibility, calculateAge, DEFAULT_EVENT_CONFIG } = require('./services/eligibilityEngine');
const { createMockTextractBlocks, processTextractVerification } = require('./services/textractAdapter');

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     ${err.message}`);
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING FINTRUST.AI TRUST ENGINE TEST SUITE');
  console.log('======================================================\n');

  console.log('1. UIDAI Verhoeff Checksum Validator:');
  it('Validates legitimate 12-digit Aadhaar with mathematical Verhoeff check', () => {
    const res = validateAadhaar('5829 4832 9181');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.isMasked, false);
  });

  it('Rejects invalid checksum digit', () => {
    const res = validateAadhaar('5829 4832 9189'); // Altered last digit
    assert.strictEqual(res.valid, false);
  });

  it('Supports masked Aadhaar (XXXX-XXXX-1234)', () => {
    const res = validateAadhaar('XXXX-XXXX-9182');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.isMasked, true);
  });

  console.log('\n2. Multi-Document Indian ID Parser:');
  it('Correctly identifies and parses Aadhaar card', () => {
    const text = "GOVERNMENT OF INDIA\nRohan Sharma\nDOB: 14/06/2005\n5829 4832 9182";
    const parsed = parseDocument(text);
    assert.strictEqual(parsed.documentType, 'AADHAAR');
    assert.strictEqual(parsed.fields.name, 'Rohan Sharma');
    assert.strictEqual(parsed.fields.dob, '14-06-2005');
  });

  it('Correctly identifies and parses PAN card with 4th char Individual validation', () => {
    const text = "INCOME TAX DEPARTMENT\nABCPA5678K\nADITYA KUMAR\nDOB: 08/07/2002";
    const parsed = parseDocument(text);
    assert.strictEqual(parsed.documentType, 'PAN');
    assert.strictEqual(parsed.fields.idNumber, 'ABCPA5678K');
    assert.strictEqual(parsed.validation.checksumPassed, true);
  });

  it('Correctly identifies and parses College Student ID with accredited institution', () => {
    const text = "NATIONAL INSTITUTE OF TECHNOLOGY\nStudent ID Card\nName: Priya Sundaram\nRoll No: 22B030045\nValid Upto: 2027";
    const parsed = parseDocument(text);
    assert.strictEqual(parsed.documentType, 'COLLEGE_ID');
    assert.strictEqual(parsed.fields.institution, 'Institute of Technology');
    assert.strictEqual(parsed.fields.idNumber, '22B030045');
  });

  console.log('\n3. Deep Forensic Tamper & Quality Engine:');
  it('Flags digital alteration / font anomaly in Date of Birth', () => {
    const forensic = analyzeDocumentForensics({
      ocrData: { text: "DOB: 22/09/2002" },
      simulatedAnomaly: 'TAMPERED_DOB'
    });
    assert.strictEqual(forensic.isTampered, true);
    assert.strictEqual(forensic.tamperRiskLevel, 'CRITICAL');
    assert(forensic.anomalies.some(a => a.field === 'DOB'));
  });

  it('Gives high authenticity score for clean document', () => {
    const forensic = analyzeDocumentForensics({
      ocrData: { text: "GOVERNMENT OF INDIA\nRohan Sharma\n5829 4832 9182" },
      simulatedAnomaly: null
    });
    assert.strictEqual(forensic.isTampered, false);
    assert(forensic.authenticityScore >= 90);
  });

  console.log('\n4. Biometric Face Matcher:');
  it('Confirms biometric match between ID photo and matching selfie', () => {
    const match = verifyFaceMatch({ idPhoto: 'photo', selfie: 'selfie', simulatedAnomaly: null });
    assert.strictEqual(match.isMatch, true);
    assert(match.similarityScore >= 70);
  });

  it('Flags biometric mismatch when impersonator selfie is provided', () => {
    const match = verifyFaceMatch({ idPhoto: 'photo', selfie: 'selfie', simulatedAnomaly: 'FACE_MISMATCH' });
    assert.strictEqual(match.isMatch, false);
    assert.strictEqual(match.status, 'REJECTED_MISMATCH');
  });

  console.log('\n5. Sybil & Duplicate ID Detection:');
  it('Detects critical syndicate fraud when same ID is reused under different name', () => {
    const check = dedupService.checkDuplicate({
      idNumber: '5489 1234 9876', // Seeded under Rohan Gupta
      applicantName: 'Vikram Patel'
    });
    assert.strictEqual(check.isDuplicate, true);
    assert.strictEqual(check.isSybilAttack, true);
    assert(check.flags.some(f => f.type === 'SYBIL_ID_REUSE_DIFFERENT_NAME'));
  });

  console.log('\n6. Hackathon Eligibility Rules & Zero False Positive Routing:');
  it('Calculates exact age on event date', () => {
    const age = calculateAge('14-06-2005', '2026-09-18');
    assert.strictEqual(age, 21);
  });

  it('Auto-approves eligible applicant with high trust score', () => {
    const applicant = { name: 'Rohan Sharma', college: 'National Institute of Technology' };
    const parsedDoc = {
      documentType: 'AADHAAR',
      fields: { name: 'Rohan Sharma', dob: '14-06-2005', idNumber: '5829 4832 9182' },
      validation: { isValidFormat: true, checksumPassed: true, notes: [] }
    };
    const forensicResults = { authenticityScore: 98, isTampered: false };
    const faceMatchResults = { performed: true, isMatch: true, similarityScore: 95 };
    const dedupResults = { isDuplicate: false, isSybilAttack: false, flags: [] };

    const verdict = evaluateEligibility({
      applicant,
      parsedDoc,
      forensicResults,
      faceMatchResults,
      dedupResults,
      eventConfig: DEFAULT_EVENT_CONFIG
    });

    assert.strictEqual(verdict.status, 'VERIFIED');
    assert.strictEqual(verdict.statusBadge, 'AUTO-VERIFIED');
    assert(verdict.trustScore >= 80);
  });

  it('Routes minor nickname variation (Aditya K. vs Aditya Kumar) to Review Queue without false rejection', () => {
    const applicant = { name: 'Aditya K.', college: 'COEP' };
    const parsedDoc = {
      documentType: 'PAN',
      fields: { name: 'ADITYA KUMAR', dob: '08-07-2002', idNumber: 'ABCPA5678K' },
      validation: { isValidFormat: true, checksumPassed: true, notes: [] }
    };
    const forensicResults = { authenticityScore: 95, isTampered: false };
    const faceMatchResults = { performed: true, isMatch: true, similarityScore: 92 };
    const dedupResults = { isDuplicate: false, isSybilAttack: false, flags: [] };

    const verdict = evaluateEligibility({
      applicant,
      parsedDoc,
      forensicResults,
      faceMatchResults,
      dedupResults,
      eventConfig: DEFAULT_EVENT_CONFIG
    });

    assert.strictEqual(verdict.status, 'REVIEW_NEEDED');
    assert.strictEqual(verdict.isHardBlocked, false);
  });

  console.log('\n7. AWS Textract Drop-In Adapter:');
  it('Processes raw Textract Blocks and produces backward-compatible output', () => {
    const mockBlocks = createMockTextractBlocks([
      'GOVERNMENT OF INDIA',
      'Priya Sundaram',
      'DOB: 10/04/2004',
      '9182 3847 1928'
    ]);
    const res = processTextractVerification({
      textractBlocks: mockBlocks,
      applicant: { name: 'Priya Sundaram', college: 'National Institute of Technology' }
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.legacyCompat.extractedDOB, '10-04-2004');
    assert.strictEqual(res.legacyCompat.extractedAge, 22);
    assert(res.enrichedVerification.trustScore > 0);
  });

  console.log('\n======================================================');
  console.log(`🏁 TEST SUITE FINISHED: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('======================================================\n');
}

runAllTests();
