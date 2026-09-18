export interface Applicant {
  name: string;
  email: string;
  phone: string;
  college: string;
}

export interface FlagItem {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  conflictingRegistrationId?: string;
  originalApplicantName?: string;
  timestamp?: string;
}

export interface ScoreBreakdown {
  authenticity: number;
  faceBiometrics: number;
  identityEligibility: number;
  deduplication: number;
}

export interface ForensicAnomaly {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  field: string;
  description: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  recommendation: string;
}

export interface RegistrationRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  docType: 'AADHAAR' | 'COLLEGE_ID' | 'PAN' | 'VOTER_ID' | 'DRIVING_LICENSE' | 'UNKNOWN';
  idNumber: string;
  dob: string | null;
  age: number | null;
  status: 'VERIFIED' | 'REVIEW_NEEDED' | 'REJECTED';
  statusBadge: string;
  trustScore: number;
  scoreBreakdown?: ScoreBreakdown;
  decisionReason: string;
  flags?: FlagItem[];
  isSybilAttack?: boolean;
  isDuplicate?: boolean;
  sybilConflictRecord?: any;
  documentImage?: string;
  selfieImage?: string;
  forensics?: {
    authenticityScore: number;
    qualityScore: number;
    tamperRiskLevel: string;
    isTampered: boolean;
    anomalies: ForensicAnomaly[];
  };
  biometrics?: {
    faceMatchStatus: string;
    similarityScore: number;
    reason: string;
  };
  parsedFields?: {
    name: string | null;
    dob: string | null;
    idNumber: string | null;
    gender: string | null;
    institution: string | null;
    validUpto: string | null;
    rollNo: string | null;
  };
  ticket?: any;
  checkInStatus?: string;
  timestamp: string;
}

export interface TestVector {
  id: string;
  label: string;
  category: string;
  expectedOutcome: string;
  description: string;
  applicant: Applicant;
  docType: string;
  idNumber: string;
  dob: string;
  ocrLines: string[];
  simulatedAnomaly: string | null;
  documentSvg: string;
  selfieSvg: string;
}

export interface EventConfig {
  eventId: string;
  eventName: string;
  eventDate: string;
  ageRestrictions: {
    enabled: true;
    minAge: number;
    maxAge: number;
  };
  studentOnly: boolean;
  requireFaceMatch: boolean;
  acceptedDocTypes: string[];
  thresholds: {
    autoApproveScore: number;
    reviewQueueScore: number;
  };
}
