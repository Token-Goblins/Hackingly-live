// 8 Preloaded Comprehensive Test Vectors for AI Build Challenge Demonstration
const { createMockTextractBlocks } = require('./textractAdapter');

// Helper to generate an SVG document image data URI for realistic mock rendering
function generateCardSvg({ title, subtitle, name, dob, idNumber, docType, isTampered = false, isBlurry = false }) {
  const bgGrad = docType === 'AADHAAR' 
    ? 'linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #f0fdf4 100%)' 
    : docType === 'COLLEGE_ID'
    ? 'linear-gradient(135deg, #eff6ff 0%, #ffffff 60%, #e0e7ff 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)';

  const badgeColor = docType === 'AADHAAR' ? '#ea580c' : docType === 'COLLEGE_ID' ? '#2563eb' : '#059669';

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <filter id="blurFilter" x="0" y="0">
        <feGaussianBlur stdDeviation="${isBlurry ? '5' : '0'}" />
      </filter>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${docType === 'AADHAAR' ? '#ffedd5' : '#dbeafe'}" />
        <stop offset="100%" stop-color="#ffffff" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="16" fill="url(#bg)" stroke="#cbd5e1" stroke-width="2" filter="url(#blurFilter)"/>
    
    <!-- Header Banner -->
    <rect x="0" y="0" width="600" height="70" fill="${badgeColor}" rx="16"/>
    <rect x="0" y="50" width="600" height="20" fill="${badgeColor}"/>
    <text x="30" y="42" fill="#ffffff" font-family="Arial, sans-serif" font-size="20" font-weight="bold">${title}</text>
    <text x="30" y="60" fill="#fed7aa" font-family="Arial, sans-serif" font-size="12">${subtitle}</text>

    <!-- Photo Placeholder Box -->
    <rect x="35" y="95" width="130" height="160" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <circle cx="100" cy="155" r="32" fill="#94a3b8"/>
    <path d="M 60 235 Q 100 185 140 235" fill="#64748b"/>
    <text x="100" y="245" fill="#475569" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">Official Photo</text>

    <!-- Details -->
    <text x="190" y="125" fill="#64748b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">FULL NAME</text>
    <text x="190" y="148" fill="#0f172a" font-family="Arial, sans-serif" font-size="19" font-weight="bold">${name}</text>

    <text x="190" y="185" fill="#64748b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">DATE OF BIRTH / BATCH</text>
    <rect x="185" y="195" width="${isTampered ? '160' : '0'}" height="${isTampered ? '30' : '0'}" fill="#fecaca" opacity="0.6" stroke="#ef4444" stroke-dasharray="3,3"/>
    <text x="190" y="215" fill="${isTampered ? '#dc2626' : '#0f172a'}" font-family="${isTampered ? 'Courier New, monospace' : 'Arial, sans-serif'}" font-size="${isTampered ? '22' : '17'}" font-weight="bold">${dob} ${isTampered ? '⚠️' : ''}</text>

    <text x="190" y="255" fill="#64748b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">ID NUMBER</text>
    <text x="190" y="280" fill="#0f172a" font-family="monospace" font-size="20" font-weight="bold" letter-spacing="2">${idNumber}</text>

    <!-- Footer Seal & Barcode -->
    <rect x="35" y="295" width="530" height="2" fill="#e2e8f0"/>
    <text x="35" y="325" fill="#64748b" font-family="Arial, sans-serif" font-size="11">Government / Institution Authenticated • Verified Digital Security Standard</text>
    <rect x="440" y="105" width="125" height="125" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="502" y="172" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">QR VERIFIED</text>
  </svg>`;
}

// Generate realistic SVG selfie data URI
function generateSelfieSvg({ name, gender = 'male', mismatch = false }) {
  const skinColor = '#e0ac69';
  const shirtColor = mismatch ? '#ec4899' : '#3b82f6';

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#f1f5f9"/>
    <!-- Person Head -->
    <circle cx="200" cy="170" r="75" fill="${skinColor}"/>
    <!-- Eyes -->
    <circle cx="175" cy="160" r="8" fill="#1e293b"/>
    <circle cx="225" cy="160" r="8" fill="#1e293b"/>
    <!-- Nose -->
    <path d="M 200 165 L 195 185 L 205 185 Z" fill="#c68a4c"/>
    <!-- Smile -->
    <path d="M 180 200 Q 200 220 220 200" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round"/>
    <!-- Torso -->
    <path d="M 100 370 C 100 270 300 270 300 370 Z" fill="${shirtColor}"/>
    <text x="200" y="375" fill="#64748b" font-family="Arial, sans-serif" font-size="14" text-anchor="middle">${name} (Live Selfie)</text>
    ${mismatch ? '<text x="200" y="45" fill="#dc2626" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">⚠️ IMPERSONATION TEST CASE</text>' : ''}
  </svg>`;
}

const TEST_VECTORS = [
  {
    id: 'TEST-01',
    label: '1. Valid Aadhaar (Eligible Student, 21 yo)',
    category: 'GENUINE_APPROVED',
    expectedOutcome: 'AUTO-VERIFIED (Score: 96%)',
    description: 'Genuine Aadhaar card with valid 12-digit Verhoeff checksum, crisp resolution, age 21 within 18-25 bracket, and matching selfie.',
    applicant: {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@gmail.com',
      college: 'National Institute of Technology',
      phone: '+91 98765 43210'
    },
    docType: 'AADHAAR',
    idNumber: '5829 4832 9181', // Valid Verhoeff
    dob: '14-06-2005',
    ocrLines: [
      'GOVERNMENT OF INDIA',
      'Unique Identification Authority of India',
      'Rohan Sharma',
      'DOB: 14/06/2005',
      'Gender: MALE',
      '5829 4832 9181',
      'Mera Aadhaar, Meri Pehchan'
    ],
    simulatedAnomaly: null,
    documentSvg: generateCardSvg({
      title: 'GOVERNMENT OF INDIA',
      subtitle: 'Unique Identification Authority of India',
      name: 'Rohan Sharma',
      dob: '14-06-2005',
      idNumber: '5829 4832 9181',
      docType: 'AADHAAR'
    }),
    selfieSvg: generateSelfieSvg({ name: 'Rohan Sharma' })
  },
  {
    id: 'TEST-02',
    label: '2. Tampered Aadhaar (Photoshop Edited DOB)',
    category: 'TAMPER_FORGERY',
    expectedOutcome: 'FLAGGED FORGERY (Score: 28%)',
    description: 'Underage applicant (actual birth year 2009) edited their birth year to 2002 using Photoshop clone stamp and different digital font.',
    applicant: {
      name: 'Ananya Verma',
      email: 'ananya.v@gmail.com',
      college: 'National Institute of Technology',
      phone: '+91 98111 22334'
    },
    docType: 'AADHAAR',
    idNumber: '9283 7412 6543',
    dob: '22-09-2002', // Tampered text
    ocrLines: [
      'GOVERNMENT OF INDIA',
      'Unique Identification Authority of India',
      'Ananya Verma',
      'DOB: 22/09/2002', // Edited font
      'Gender: FEMALE',
      '9283 7412 6543'
    ],
    simulatedAnomaly: 'TAMPERED_DOB',
    documentSvg: generateCardSvg({
      title: 'GOVERNMENT OF INDIA',
      subtitle: 'Aadhaar Card (Digital Alteration)',
      name: 'Ananya Verma',
      dob: '22-09-2002',
      idNumber: '9283 7412 6543',
      docType: 'AADHAAR',
      isTampered: true
    }),
    selfieSvg: generateSelfieSvg({ name: 'Ananya Verma', gender: 'female' })
  },
  {
    id: 'TEST-03',
    label: '3. Sybil Attack / ID Reuse Under Different Name',
    category: 'SYBIL_FRAUD',
    expectedOutcome: 'CRITICAL FRAUD ALERT (Score: 12%)',
    description: 'Applicant "Vikram Patel" attempts to register using the exact Aadhaar number (5489 1234 9876) already registered and verified by "Rohan Gupta".',
    applicant: {
      name: 'Vikram Patel',
      email: 'vikram.patel.dev@gmail.com',
      college: 'National Engineering Academy',
      phone: '+91 97777 88888'
    },
    docType: 'AADHAAR',
    idNumber: '5489 1234 9876', // Conflicts with seeded Rohan Gupta!
    dob: '15-08-2003',
    ocrLines: [
      'GOVERNMENT OF INDIA',
      'Unique Identification Authority of India',
      'Vikram Patel',
      'DOB: 15/08/2003',
      'Gender: MALE',
      '5489 1234 9876'
    ],
    simulatedAnomaly: null,
    documentSvg: generateCardSvg({
      title: 'GOVERNMENT OF INDIA',
      subtitle: 'Syndicate ID Reuse Vector',
      name: 'Vikram Patel',
      dob: '15-08-2003',
      idNumber: '5489 1234 9876',
      docType: 'AADHAAR'
    }),
    selfieSvg: generateSelfieSvg({ name: 'Vikram Patel' })
  },
  {
    id: 'TEST-04',
    label: '4. Valid College ID (Institute of Technology, Class of 2027)',
    category: 'GENUINE_COLLEGE_APPROVED',
    expectedOutcome: 'AUTO-VERIFIED (Score: 94%)',
    description: 'Valid accredited student ID card from Institute of Technology, roll number 22B030045, batch graduating 2027.',
    applicant: {
      name: 'Priya Sundaram',
      email: 'priya.s@tech.ac.in',
      college: 'National Institute of Technology',
      phone: '+91 96543 21098'
    },
    docType: 'COLLEGE_ID',
    idNumber: '22B030045',
    dob: '10-04-2004',
    ocrLines: [
      'NATIONAL INSTITUTE OF TECHNOLOGY',
      'Student Identity Card',
      'Name: Priya Sundaram',
      'Roll No: 22B030045',
      'Department: Computer Science and Engineering',
      'Valid Upto: June 2027',
      'DOB: 10/04/2004'
    ],
    simulatedAnomaly: null,
    documentSvg: generateCardSvg({
      title: 'INSTITUTE OF TECHNOLOGY',
      subtitle: 'Student Identity Card 2023-2027',
      name: 'Priya Sundaram',
      dob: 'Valid Upto 2027',
      idNumber: '22B030045',
      docType: 'COLLEGE_ID'
    }),
    selfieSvg: generateSelfieSvg({ name: 'Priya Sundaram', gender: 'female' })
  },
  {
    id: 'TEST-05',
    label: '5. Expired College ID (Graduated Alumni, Batch 2021)',
    category: 'INELIGIBLE_STUDENT',
    expectedOutcome: 'STUDENT INELIGIBLE (Score: 48%)',
    description: 'Applicant provided a college ID that expired in 2021. Fails the "active student only" hackathon rule.',
    applicant: {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@alumni.tech.edu',
      college: 'Premier Institute of Science',
      phone: '+91 99887 66554'
    },
    docType: 'COLLEGE_ID',
    idNumber: '2017A7PS0124P',
    dob: '18-02-1999',
    ocrLines: [
      'PREMIER INSTITUTE OF SCIENCE AND TECHNOLOGY',
      'Student ID Card',
      'Name: Arjun Mehta',
      'ID: 2017A7PS0124P',
      'Valid Upto: May 2021', // Expired
      'DOB: 18/02/1999'
    ],
    simulatedAnomaly: null,
    documentSvg: generateCardSvg({
      title: 'PREMIER INSTITUTE',
      subtitle: 'Student ID (Expired)',
      name: 'Arjun Mehta',
      dob: 'Expired: May 2021',
      idNumber: '2017A7PS0124P',
      docType: 'COLLEGE_ID'
    }),
    selfieSvg: generateSelfieSvg({ name: 'Arjun Mehta' })
  },
  {
    id: 'TEST-06',
    label: '6. Biometric Impersonation (Face Mismatch)',
    category: 'FACE_MISMATCH',
    expectedOutcome: 'BIOMETRIC REJECTED (Score: 32%)',
    description: 'Applicant uploaded a genuine ID of Sneha Roy, but the live webcam selfie provided is of an entirely different person.',
    applicant: {
      name: 'Sneha Roy',
      email: 'sneha.roy@gmail.com',
      college: 'Metropolitan University',
      phone: '+91 95432 10987'
    },
    docType: 'AADHAAR',
    idNumber: '6192 8472 1948',
    dob: '12-11-2003',
    ocrLines: [
      'GOVERNMENT OF INDIA',
      'Sneha Roy',
      'DOB: 12/11/2003',
      'Gender: FEMALE',
      '6192 8472 1948'
    ],
    simulatedAnomaly: 'FACE_MISMATCH',
    documentSvg: generateCardSvg({
      title: 'GOVERNMENT OF INDIA',
      subtitle: 'Aadhaar Card',
      name: 'Sneha Roy',
      dob: '12-11-2003',
      idNumber: '6192 8472 1948',
      docType: 'AADHAAR'
    }),
    selfieSvg: generateSelfieSvg({ name: 'Impersonator', mismatch: true })
  },
  {
    id: 'TEST-07',
    label: '7. Minor Name Variation ("Aditya K." vs "Aditya Kumar")',
    category: 'REVIEW_QUEUE_MINIMAL_FALSE_POSITIVE',
    expectedOutcome: 'REVIEW QUEUE (Score: 74%)',
    description: 'Applicant entered "Aditya K." on the registration form while the government PAN card states "Aditya Kumar". Demonstrates zero false rejection: routes safely to organizer 1-click review queue.',
    applicant: {
      name: 'Aditya K.',
      email: 'aditya.k@gmail.com',
      college: 'COEP Tech',
      phone: '+91 91234 56789'
    },
    docType: 'PAN',
    idNumber: 'ABCPA5678K',
    dob: '08-07-2002',
    ocrLines: [
      'INCOME TAX DEPARTMENT GOVT OF INDIA',
      'Permanent Account Number Card',
      'ABCPA5678K',
      'Name: ADITYA KUMAR',
      'Father Name: RAJESH KUMAR',
      'DOB: 08/07/2002'
    ],
    simulatedAnomaly: null,
    documentSvg: generateCardSvg({
      title: 'INCOME TAX DEPARTMENT',
      subtitle: 'Permanent Account Number Card',
      name: 'ADITYA KUMAR',
      dob: '08/07/2002',
      idNumber: 'ABCPA5678K',
      docType: 'PAN'
    }),
    selfieSvg: generateSelfieSvg({ name: 'Aditya K.' })
  },
  {
    id: 'TEST-08',
    label: '8. Blurry Photo / Low-Light Camera Capture',
    category: 'QUALITY_RETRY',
    expectedOutcome: 'RETRY PROMPT / REVIEW (Score: 58%)',
    description: 'Participant captured ID in low light with motion blur. Demonstrates intelligent quality gating: instead of an irreversible rejection, it alerts user with tips to re-take in good lighting.',
    applicant: {
      name: 'Kavita Joshi',
      email: 'kavita.joshi@gmail.com',
      college: 'Manipal Institute of Technology',
      phone: '+91 93456 78901'
    },
    docType: 'AADHAAR',
    idNumber: '7392 8410 5928',
    dob: '30-01-2004',
    ocrLines: [
      'GOVERNMENT OF INDIA',
      'Kavita Joshi',
      'DOB: 30/01/2004',
      '7392 8410 5928'
    ],
    simulatedAnomaly: 'BLURRY',
    documentSvg: generateCardSvg({
      title: 'GOVERNMENT OF INDIA',
      subtitle: 'Motion Blur Simulation',
      name: 'Kavita Joshi',
      dob: '30-01-2004',
      idNumber: '7392 8410 5928',
      docType: 'AADHAAR',
      isBlurry: true
    }),
    selfieSvg: generateSelfieSvg({ name: 'Kavita Joshi', gender: 'female' })
  }
];

module.exports = {
  TEST_VECTORS,
  generateCardSvg,
  generateSelfieSvg
};
