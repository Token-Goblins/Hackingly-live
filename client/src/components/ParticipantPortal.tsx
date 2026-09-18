import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, CheckCircle, AlertTriangle, AlertOctagon, 
  ShieldCheck, RefreshCw, User, 
  FileText, Sparkles, Eye, Check,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ParticipantTicket } from './ParticipantTicket';
import type { Applicant, RegistrationRecord, TestVector } from '../types';

interface ParticipantPortalProps {
  onVerificationComplete: (record: RegistrationRecord) => void;
  selectedTestVector: TestVector | null;
  onClearTestVector: () => void;
  onOpenTestVectors: () => void;
}

export const ParticipantPortal: React.FC<ParticipantPortalProps> = ({
  onVerificationComplete,
  selectedTestVector,
  onClearTestVector,
  onOpenTestVectors
}) => {
  const [applicant, setApplicant] = useState<Applicant>({
    name: selectedTestVector?.applicant.name || 'Rohan Sharma',
    email: selectedTestVector?.applicant.email || 'rohan.sharma@gmail.com',
    phone: selectedTestVector?.applicant.phone || '+91 98765 43210',
    college: selectedTestVector?.applicant.college || 'National Institute of Technology'
  });

  const [docType, setDocType] = useState<string>(selectedTestVector?.docType || 'AADHAAR');
  const [documentImage, setDocumentImage] = useState<string | null>(selectedTestVector?.documentSvg || null);
  const [selfieImage, setSelfieImage] = useState<string | null>(selectedTestVector?.selfieSvg || null);
  const [rawOcrText, setRawOcrText] = useState<string>(selectedTestVector ? selectedTestVector.ocrLines.join('\n') : '');
  const [simulatedAnomaly, setSimulatedAnomaly] = useState<string | null>(selectedTestVector?.simulatedAnomaly || null);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Verification progress state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [result, setResult] = useState<RegistrationRecord | null>(null);

  // Synchronize when test vector is loaded
  React.useEffect(() => {
    if (selectedTestVector) {
      setApplicant(selectedTestVector.applicant);
      setDocType(selectedTestVector.docType);
      setDocumentImage(selectedTestVector.documentSvg);
      setSelfieImage(selectedTestVector.selfieSvg);
      setRawOcrText(selectedTestVector.ocrLines.join('\n'));
      setSimulatedAnomaly(selectedTestVector.simulatedAnomaly);
      setResult(null);
    }
  }, [selectedTestVector]);

  // Calculate dynamic progress percentage
  const calculateProgress = (): number => {
    let score = 0;
    if (applicant.name && applicant.email && applicant.college) score += 30;
    if (documentImage) score += 25;
    if (selfieImage) score += 25;
    if (result) score += 20;
    return score;
  };

  const progressPercent = calculateProgress();

  // File upload handlers
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDocumentImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelfieImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start webcam
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access webcam. Please upload a photo instead.');
      setIsCameraActive(false);
    }
  };

  // Capture webcam photo
  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelfieImage(dataUrl);

        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setIsCameraActive(false);
      }
    }
  };

  // Run Verification Pipeline
  const runVerification = async () => {
    setIsVerifying(true);
    setResult(null);

    const steps = [
      'Extracting document structure via OCR engine...',
      'Performing ELA & typography tamper forensics...',
      'Comparing biometric facial vectors with live selfie...',
      'Querying Sybil deduplication index for multi-identity reuse...',
      'Evaluating age & student eligibility rules...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setVerificationStep(steps[i]);
      await new Promise(r => setTimeout(r, 400));
    }

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant,
          documentType: docType,
          rawOcrText,
          documentImage,
          selfieImage,
          simulatedAnomaly,
          testCaseId: selectedTestVector?.id
        })
      });

      const data = await response.json();
      const record = data.registration || data.record;

      if (data.success && record) {
        setResult(record);
        onVerificationComplete(record);

        if (record.status === 'VERIFIED') {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
      } else {
        alert(`Verification failed: ${data.error || 'Unknown response from server'}`);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      alert(`Verification failed: ${err?.message || 'Server connection error'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 340px',
      gap: '24px',
      alignItems: 'start'
    }}>
      
      {/* Center Column: Onboarding & Registration Form */}
      <div>

        {/* Top Greeting Header */}
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Welcome, {applicant.name ? applicant.name.split(' ')[0] : 'Applicant'}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              Complete your institutional identity and eligibility compliance verification.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onOpenTestVectors}
              className="btn-primary"
              id="btn-load-sample-top"
            >
              <Sparkles size={16} />
              <span>Load Test Vectors</span>
            </button>
            {selectedTestVector && (
              <button
                onClick={onClearTestVector}
                className="btn-secondary"
              >
                Clear Preset
              </button>
            )}
          </div>
        </div>

        {/* Selected Test Vector Alert Banner */}
        {selectedTestVector && (
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles size={18} color="#2563EB" />
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#2563EB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontFamily: 'var(--font-mono)'
                }}>
                  Active Vector: {selectedTestVector.id}
                </span>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                  {selectedTestVector.label}
                </p>
              </div>
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: '#FFFFFF',
              color: '#2563EB',
              border: '1px solid #BFDBFE',
              fontFamily: 'var(--font-mono)'
            }}>
              Expected: {selectedTestVector.expectedOutcome}
            </span>
          </div>
        )}

        {/* Swiss FinTech Applicant Profile Card */}
        <div className="swiss-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              
              {/* Document / Avatar Thumbnail Preview */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {documentImage ? (
                  <img src={documentImage} alt="ID Document" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FileText size={28} color="#64748B" />
                )}
              </div>

              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#2563EB',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  Primary Applicant Record
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {applicant.name || 'Enter Legal Name'}
                </h2>
                <p style={{ fontSize: '12px', color: '#64748B' }}>
                  Supported Proofs: Aadhaar, College Student ID, Permanent Account Number (PAN)
                </p>
              </div>
            </div>

            {/* Document Upload Button */}
            <label className="btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={15} />
              <span>Attach ID Document</span>
              <input type="file" accept="image/*" onChange={handleDocFileUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Form Inputs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Full Legal Name
              </label>
              <input
                type="text"
                value={applicant.name}
                onChange={e => setApplicant({ ...applicant, name: e.target.value })}
                placeholder="Rohan Sharma"
                id="input-applicant-name"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Educational Institution
              </label>
              <input
                type="text"
                value={applicant.college}
                onChange={e => setApplicant({ ...applicant, college: e.target.value })}
                placeholder="Institute of Technology"
                id="input-applicant-college"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={applicant.email}
                onChange={e => setApplicant({ ...applicant, email: e.target.value })}
                placeholder="applicant@example.com"
                id="input-applicant-email"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="text"
                className="font-mono"
                value={applicant.phone}
                onChange={e => setApplicant({ ...applicant, phone: e.target.value })}
                placeholder="+91 98765 43210"
                id="input-applicant-phone"
              />
            </div>
          </div>

          {/* Document Type Selector */}
          <div style={{ marginTop: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Select Verification Proof Type
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { id: 'AADHAAR', label: 'Aadhaar (UIDAI Verhoeff Checksum)' },
                { id: 'COLLEGE_ID', label: 'College Student ID' },
                { id: 'PAN', label: 'Permanent Account Number (PAN)' }
              ].map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDocType(d.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: docType === d.id ? 600 : 500,
                    backgroundColor: docType === d.id ? '#2563EB' : '#FFFFFF',
                    color: docType === d.id ? '#FFFFFF' : '#475569',
                    border: docType === d.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Verification Checklist */}
        <div className="swiss-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
              Verification Checklist
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              {documentImage && selfieImage ? '3 of 3 steps ready' : documentImage || selfieImage ? '2 of 3 steps ready' : '1 of 3 steps ready'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Task Item 1: Personal Details */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: applicant.name && applicant.college ? '#10B981' : '#E2E8F0',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {applicant.name && applicant.college ? <Check size={14} strokeWidth={3} /> : null}
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    Personal Details & Affiliation
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>
                    Legal name, educational affiliation, and contact details
                  </p>
                </div>
              </div>
              <span className="badge-success" style={{ fontSize: '11px' }}>
                COMPLETED
              </span>
            </div>

            {/* Task Item 2: Document Proof */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: documentImage ? '#10B981' : '#E2E8F0',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {documentImage ? <Check size={14} strokeWidth={3} /> : null}
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    Identity Document File ({docType})
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>
                    {documentImage ? 'Document photo attached and ready for OCR analysis' : 'Upload document photo or load a sample vector'}
                  </p>
                </div>
              </div>
              {documentImage ? (
                <span className="badge-success" style={{ fontSize: '11px' }}>
                  ATTACHED
                </span>
              ) : (
                <label className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', cursor: 'pointer' }}>
                  <Upload size={14} /> Upload
                  <input type="file" accept="image/*" onChange={handleDocFileUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Task Item 3: Biometric Liveness */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: selfieImage ? '#10B981' : '#E2E8F0',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selfieImage ? <Check size={14} strokeWidth={3} /> : null}
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    Biometric Portrait Match
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>
                    {selfieImage ? 'Selfie captured for facial vector comparison' : 'Take a live webcam selfie or upload photo'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={startCamera}
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  id="btn-open-camera"
                >
                  <Camera size={14} /> Webcam
                </button>
                <label className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', cursor: 'pointer' }}>
                  <Upload size={14} /> Photo
                  <input type="file" accept="image/*" onChange={handleSelfieFileUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Biometric Camera View & OCR Stream (Dual Card) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          {/* Biometric Card */}
          <div className="swiss-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={16} color="#2563EB" />
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  Biometric Face Capture
                </h4>
              </div>
              <span className="badge-neutral" style={{ fontSize: '11px' }}>
                LIVENESS
              </span>
            </div>

            <div style={{
              height: '180px',
              borderRadius: '6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isCameraActive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute',
                    width: '120px',
                    height: '150px',
                    border: '2px dashed #2563EB',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                  }} />
                  <button
                    onClick={captureCameraPhoto}
                    className="btn-primary"
                    style={{ position: 'absolute', bottom: '10px', padding: '6px 14px', fontSize: '12px' }}
                  >
                    <Camera size={14} /> Capture
                  </button>
                </>
              ) : selfieImage ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={selfieImage} alt="Selfie" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  <span style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    backgroundColor: '#FFFFFF',
                    color: '#2563EB',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #BFDBFE'
                  }}>
                    READY
                  </span>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#64748B' }}>
                  <User size={32} color="#94A3B8" style={{ margin: '0 auto 6px' }} />
                  <p style={{ fontSize: '12px' }}>No portrait selfie attached</p>
                </div>
              )}
            </div>
          </div>

          {/* Document OCR Stream Card */}
          <div className="swiss-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="#2563EB" />
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  Document OCR Stream
                </h4>
              </div>
              <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                LIVE TEXT
              </span>
            </div>

            <textarea
              className="font-mono"
              rows={6}
              style={{
                fontSize: '12px',
                resize: 'none',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                height: '180px'
              }}
              value={rawOcrText}
              onChange={e => setRawOcrText(e.target.value)}
              placeholder="Extracted document text lines..."
              id="textarea-ocr-stream"
            />
          </div>

        </div>

        {/* Verification Action Button */}
        <div style={{ marginBottom: '28px' }}>
          <button
            onClick={runVerification}
            disabled={isVerifying || !applicant.name}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              borderRadius: '8px',
              fontWeight: 600
            }}
            id="btn-run-verification"
          >
            {isVerifying ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Running Verification Pipeline...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={20} />
                <span>Verify Identity & Issue Digital Pass</span>
              </>
            )}
          </button>
        </div>

        {/* Processing State Notice */}
        {isVerifying && (
          <div style={{
            padding: '18px 24px',
            borderRadius: '8px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <RefreshCw size={16} className="animate-spin" />
              <h4 style={{ fontSize: '14px', fontWeight: 600 }}>
                Verification Pipeline Active
              </h4>
            </div>
            <p style={{ fontSize: '12px', color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
              {verificationStep}
            </p>
          </div>
        )}

        {/* Verification Result Card */}
        {result && !isVerifying && (
          <div className="swiss-card" style={{
            borderLeft: result.status === 'VERIFIED'
              ? '4px solid #10B981'
              : result.status === 'REVIEW_NEEDED'
              ? '4px solid #F59E0B'
              : '4px solid #EF4444',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className={`badge-${
                    result.status === 'VERIFIED'
                      ? 'success'
                      : result.status === 'REVIEW_NEEDED'
                      ? 'warning'
                      : 'danger'
                  }`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                    {result.status === 'VERIFIED' ? <CheckCircle size={14} /> : result.status === 'REVIEW_NEEDED' ? <AlertTriangle size={14} /> : <AlertOctagon size={14} />}
                    {result.statusBadge}
                  </span>

                  <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                    REF ID: {result.id}
                  </span>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  {result.name}
                </h2>
                <p style={{ fontSize: '13px', color: '#475569', maxWidth: '680px' }}>
                  {result.decisionReason}
                </p>
              </div>

              {/* Trust Score Display */}
              <div style={{
                textAlign: 'center',
                padding: '14px 22px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}>
                <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  Verification Score
                </span>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: result.trustScore >= 80 ? '#10B981' : result.trustScore >= 55 ? '#F59E0B' : '#EF4444',
                  lineHeight: '1.2'
                }}>
                  {result.trustScore}%
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  {result.trustScore >= 80 ? 'Confidence High' : result.trustScore >= 55 ? 'Manual Sign-off Queue' : 'Discrepancy Detected'}
                </span>
              </div>
            </div>

            {/* Score Breakdown Pillars */}
            {result.scoreBreakdown && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Document Authenticity</span>
                    <span style={{ fontWeight: 600, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{result.scoreBreakdown.authenticity} / 30</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(result.scoreBreakdown.authenticity / 30) * 100}%`, height: '100%', backgroundColor: '#2563EB' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Biometric Face Match</span>
                    <span style={{ fontWeight: 600, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{result.scoreBreakdown.faceBiometrics} / 25</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(result.scoreBreakdown.faceBiometrics / 25) * 100}%`, height: '100%', backgroundColor: '#10B981' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Identity Eligibility</span>
                    <span style={{ fontWeight: 600, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{result.scoreBreakdown.identityEligibility} / 25</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(result.scoreBreakdown.identityEligibility / 25) * 100}%`, height: '100%', backgroundColor: '#7C3AED' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Anti-Sybil Deduplication</span>
                    <span style={{ fontWeight: 600, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{result.scoreBreakdown.deduplication} / 20</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(result.scoreBreakdown.deduplication / 20) * 100}%`, height: '100%', backgroundColor: '#F59E0B' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Forensic Tamper Heatmap Overlay */}
            {result.forensics?.isTampered && result.documentImage && (
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Eye size={16} color="#DC2626" />
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#991B1B' }}>
                    Forensic Tamper Heatmap Overlay (ELA & Typography Anomaly)
                  </h4>
                </div>

                <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                  <img src={result.documentImage} alt="Forensic Analysis" style={{ maxHeight: '200px', borderRadius: '6px', border: '1px solid #EF4444' }} />
                  {result.forensics.anomalies.map((anom, aIdx) => (
                    <div
                      key={aIdx}
                      style={{
                        position: 'absolute',
                        left: `${anom.boundingBox.x}%`,
                        top: `${anom.boundingBox.y}%`,
                        width: `${anom.boundingBox.width}%`,
                        height: `${anom.boundingBox.height}%`,
                        border: '2px solid #EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.25)',
                        borderRadius: '4px'
                      }}
                      title={anom.description}
                    />
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#991B1B', marginTop: '8px' }}>
                  Digital manipulation detected in the identity region. Compression artifacts and font baseline jitter do not match original government printing.
                </p>
              </div>
            )}

            {/* Sybil Duplicate Attack Notification */}
            {result.isSybilAttack && (
              <div style={{
                padding: '14px 16px',
                borderRadius: '8px',
                backgroundColor: '#F5F3FF',
                border: '1px solid #DDD6FE',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <AlertOctagon size={22} color="#7C3AED" />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#5B21B6' }}>
                    Sybil Duplicate Graph Triggered
                  </h4>
                  <p style={{ fontSize: '12px', color: '#6D28D9' }}>
                    Identity document ({result.idNumber}) is already registered to "{result.sybilConflictRecord?.originalApplicantName}". Registration blocked from automated pass issuance.
                  </p>
                </div>
              </div>
            )}

            {/* Digital Participant Pass with Scannable QR Code */}
            {result.status === 'VERIFIED' && result.ticket && (
              <ParticipantTicket ticket={result.ticket} registrationId={result.id} />
            )}

          </div>
        )}

      </div>

      {/* Right Column: Swiss FinTech Aside Panel */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* 1. "Your Progress" Card */}
        <div className="swiss-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#2563EB" />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
                Application Status
              </h3>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
              {progressPercent}%
            </span>
          </div>

          <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', margin: '8px 0 16px' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#2563EB', transition: 'width 0.3s ease' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: applicant.name ? '#2563EB' : '#E2E8F0',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700
              }}>
                {applicant.name ? '✓' : '1'}
              </span>
              <span style={{ color: applicant.name ? '#0F172A' : '#64748B', fontWeight: applicant.name ? 600 : 500 }}>
                Applicant Profile
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: documentImage ? '#2563EB' : '#E2E8F0',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700
              }}>
                {documentImage ? '✓' : '2'}
              </span>
              <span style={{ color: documentImage ? '#0F172A' : '#64748B', fontWeight: documentImage ? 600 : 500 }}>
                Identity Proof Upload
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: selfieImage ? '#2563EB' : '#E2E8F0',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700
              }}>
                {selfieImage ? '✓' : '3'}
              </span>
              <span style={{ color: selfieImage ? '#0F172A' : '#64748B', fontWeight: selfieImage ? 600 : 500 }}>
                Biometric Portrait Match
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: result ? '#2563EB' : '#E2E8F0',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700
              }}>
                {result ? '✓' : '4'}
              </span>
              <span style={{ color: result ? '#0F172A' : '#64748B', fontWeight: result ? 600 : 500 }}>
                Verification & Pass
              </span>
            </div>
          </div>
        </div>

        {/* 2. Verification Radar Card */}
        <div className="swiss-card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '14px' }}>
            Compliance Radar
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Trust Score</span>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#2563EB', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {result ? `${result.trustScore}%` : '98.4%'}
              </p>
            </div>

            <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Forensic ELA</span>
              <p style={{ fontSize: '13px', fontWeight: 700, color: result?.forensics?.isTampered ? '#DC2626' : '#059669', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                {result?.forensics?.isTampered ? 'FLAGGED' : 'CLEAN'}
              </p>
            </div>

            <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Sybil Graph</span>
              <p style={{ fontSize: '13px', fontWeight: 700, color: result?.isSybilAttack ? '#7C3AED' : '#2563EB', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                {result?.isSybilAttack ? 'DUPLICATE' : 'UNIQUE'}
              </p>
            </div>

            <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Digital Pass</span>
              <p style={{ fontSize: '13px', fontWeight: 700, color: result?.status === 'VERIFIED' ? '#059669' : '#64748B', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                {result?.status === 'VERIFIED' ? 'ISSUED' : 'PENDING'}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Event & AI Engine Info Box */}
        <div className="swiss-card" style={{ backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
              Institutional Compliance Node
            </h4>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
            Eligibility criteria enforced: Age 18–25 & Student College ID required. Verhoeff D5 mathematical checksum calculated on Aadhaar digits.
          </p>
        </div>

      </aside>

    </div>
  );
};
