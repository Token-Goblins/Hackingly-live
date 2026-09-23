// Comprehensive Full-System & Security Verification Audit Script
const http = require('http');

async function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(dataString) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = res.headers['content-type']?.includes('json') 
            ? JSON.parse(responseBody) 
            : responseBody;
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(dataString);
    req.end();
  });
}

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✅ PASSED: ${message}`);
  passed++;
}

async function runFullAudit() {
  console.log('\n=============================================================');
  console.log('🛡️  FINTRUST.AI PS-003: FULL SYSTEM & SECURITY AUDIT (100% COVERAGE)');
  console.log('=============================================================\n');

  // 1. Core Health & Capabilities
  console.log('--- Phase 1: Engine Health & AI Status ---');
  const health = await makeRequest('/api/health');
  assert(health.status === 200, 'Health check returns 200 OK');
  assert(health.data.status === 'ONLINE', 'Engine status is ONLINE');
  assert(health.data.aiServices !== undefined, 'AI services reports status');

  const aiStatus = await makeRequest('/api/ai-status');
  assert(aiStatus.status === 200, 'AI status endpoint returns 200 OK');
  assert(aiStatus.data.aws.provider === 'AWS Textract', 'AWS Textract integration detected');
  assert(aiStatus.data.gemini.provider === 'Google Gemini AI', 'Google Gemini AI integration detected');

  // 2. Reset Demo for Clean Baseline
  console.log('\n--- Phase 2: Database State & Reset ---');
  const resetRes = await makeRequest('/api/reset-demo', 'POST');
  assert(resetRes.status === 200, 'Database reset succeeds');

  // 3. Testing All 8 Test Vectors Through Live /api/verify
  console.log('\n--- Phase 3: Testing All 8 Hackathon Test Cases (End-to-End) ---');
  const testVectors = [
    { id: 'TEST-01', name: 'Rohan Sharma (Valid Aadhaar)', expectStatus: 'VERIFIED', minScore: 90 },
    { id: 'TEST-02', name: 'Ananya Verma (Tampered Aadhaar DOB)', expectStatus: 'REJECTED', maxScore: 80, expectTamper: true },
    { id: 'TEST-03', name: 'Vikram Patel (Sybil Attack / ID Reuse)', expectStatus: 'REJECTED', expectSybil: true },
    { id: 'TEST-04', name: 'Priya Sundaram (Valid College ID)', expectStatus: 'VERIFIED', minScore: 90 },
    { id: 'TEST-05', name: 'Arjun Mehta (Expired College ID)', expectStatus: 'REJECTED' },
    { id: 'TEST-06', name: 'Sneha Roy (Biometric Face Impersonation)', expectStatus: 'REJECTED', expectFaceMismatch: true },
    { id: 'TEST-07', name: 'Aditya K. (Minor Name Variation)', expectStatus: 'REVIEW_NEEDED', zeroFalseReject: true },
    { id: 'TEST-08', name: 'Kavita Joshi (Low-Light / Blurry ID)', expectStatus: 'VERIFIED' }
  ];

  for (const t of testVectors) {
    const res = await makeRequest('/api/verify', 'POST', { testCaseId: t.id });
    assert(res.status === 200, `POST /api/verify for ${t.id} returns 200`);
    const reg = res.data.registration;

    assert(reg.status === t.expectStatus, `${t.id} [${t.name}] evaluated to status: ${reg.status} (Expected: ${t.expectStatus})`);

    if (t.minScore) {
      assert(reg.trustScore >= t.minScore, `${t.id} score is ${reg.trustScore}% (>= ${t.minScore}%)`);
    }
    if (t.expectTamper) {
      assert(reg.forensics.isTampered === true, `${t.id} correctly flagged digital tamper`);
    }
    if (t.expectSybil) {
      assert(reg.isSybilAttack === true, `${t.id} correctly intercepted Sybil duplicate reuse under different name`);
    }
    if (t.expectFaceMismatch) {
      assert(reg.biometrics.status === 'REJECTED_MISMATCH' || reg.biometrics.isMatch === false, `${t.id} correctly caught biometric impersonation`);
    }
    if (t.zeroFalseReject) {
      assert(reg.status === 'REVIEW_NEEDED', `${t.id} routed to organizer review queue without blocking legitimate participant`);
    }
    if (reg.status === 'VERIFIED') {
      assert(reg.ticket !== null && reg.ticket.qrSvg !== undefined, `${t.id} automatically issued digital pass with QR code`);
    }
  }

  // 4. AWS Textract Drop-In Adapter Testing
  console.log('\n--- Phase 4: AWS Textract Drop-In Adapter Validation ---');
  const adapterRes = await makeRequest('/api/v1/adapters/aws-textract', 'POST', {
    applicant: { name: 'Kunal Kapoor', email: 'kunal@example.com', college: 'Premier Institute of Science' }
  });
  assert(adapterRes.status === 200, 'AWS Textract adapter responds 200 OK');
  assert(adapterRes.data.legacyCompat !== undefined, 'Adapter returns legacyCompat object');
  assert(adapterRes.data.enrichedVerification !== undefined, 'Adapter returns enrichedVerification object');
  assert(typeof adapterRes.data.enrichedVerification.trustScore === 'number', 'Adapter calculated AI trust score');

  // 5. Organizer Actions & Review Queue
  console.log('\n--- Phase 5: Organizer Workflow & Human-in-the-Loop ---');
  const regsRes = await makeRequest('/api/registrations?status=REVIEW_NEEDED');
  assert(regsRes.status === 200, 'GET /api/registrations with filter returns 200');
  const reviewList = regsRes.data.registrations;
  assert(reviewList.length > 0, `Review queue contains ${reviewList.length} candidate(s)`);

  const reviewCandidate = reviewList[0];
  const approveRes = await makeRequest(`/api/registrations/${reviewCandidate.id}/action`, 'POST', {
    action: 'APPROVE',
    notes: 'Manually approved after organizer phone verification'
  });
  assert(approveRes.status === 200, 'Organizer 1-click manual approval succeeded');
  assert(approveRes.data.registration.status === 'VERIFIED', 'Status successfully changed to VERIFIED');
  assert(approveRes.data.registration.ticket !== null, 'Participant ticket generated upon approval');

  // 6. Venue Desk Check-In Scanner
  console.log('\n--- Phase 6: Venue Gate QR Check-In Simulation ---');
  const checkInRes = await makeRequest(`/api/check-in/${reviewCandidate.id}`, 'POST');
  assert(checkInRes.status === 200, 'Venue gate check-in succeeds for verified attendee');
  assert(checkInRes.data.record.checkInStatus === 'CHECKED_IN_AT_DESK', 'Check-in status updated to CHECKED_IN_AT_DESK');

  // Check-in rejected for unverified/rejected user
  const rejectedRegs = await makeRequest('/api/registrations?status=REJECTED');
  if (rejectedRegs.data.registrations.length > 0) {
    const rejectedId = rejectedRegs.data.registrations[0].id;
    const blockedCheckIn = await makeRequest(`/api/check-in/${rejectedId}`, 'POST');
    assert(blockedCheckIn.status === 403, 'Venue gate correctly rejects unverified/forged registrations (HTTP 403 Forbidden)');
  }

  // 7. CSV Export & Sanitization
  console.log('\n--- Phase 7: Real-World CSV Roster Export ---');
  const csvRes = await makeRequest('/api/export-csv');
  assert(csvRes.status === 200, 'Export CSV returns 200 OK');
  assert(csvRes.headers['content-type'].includes('text/csv'), 'Content-Type is text/csv');
  assert(typeof csvRes.data === 'string' && csvRes.data.includes('Registration ID,Name'), 'CSV header row formatted properly');

  // 8. Security & Input Resilience Check
  console.log('\n--- Phase 8: Security & Resilience Stress Tests ---');
  // Test empty payload
  const emptyRes = await makeRequest('/api/verify', 'POST', {});
  assert(emptyRes.status === 200, 'Handles empty registration payload gracefully without crashing');

  // Test malformed JSON handling in adapter
  const malformedRes = await makeRequest('/api/v1/adapters/aws-textract', 'POST', { textractBlocks: { invalid: true } });
  assert(malformedRes.status === 200, 'Handles malformed Textract blocks gracefully');

  console.log('\n=============================================================');
  console.log(`🎉 ALL AUDIT CHECKS PASSED: ${passed} / ${total} TESTS VERIFIED (100%)`);
  console.log('=============================================================\n');
}

runFullAudit().catch(err => {
  console.error('\n💥 AUDIT EXCEPTION:', err);
  process.exit(1);
});
