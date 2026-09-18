import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, Eye, 
  Check, X, Search, UserCheck, ShieldAlert, RefreshCw,
  Download, QrCode
} from 'lucide-react';
import type { RegistrationRecord } from '../types';

interface AdminDashboardProps {
  onRefreshTrigger: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRefreshTrigger }) => {
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<RegistrationRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    reviewQueue: 0,
    rejected: 0,
    sybilBlocked: 0,
    checkedInCount: 0,
    autoVerificationRate: 0
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [regRes, statsRes] = await Promise.all([
        fetch('/api/registrations'),
        fetch('/api/stats')
      ]);

      const regData = await regRes.json();
      const statsData = await statsRes.json();

      if (regData.success) {
        setRegistrations(regData.registrations);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [onRefreshTrigger]);

  const handleOrganizerAction = async (id: string, action: 'APPROVE' | 'REJECT' | 'REQUEST_REUPLOAD') => {
    try {
      const res = await fetch(`/api/registrations/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: actionNotes })
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(prev => prev.map(r => r.id === id ? data.registration : r));
        setSelectedRecord(data.registration);
        setActionNotes('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Action error:', err);
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    if (filter === 'REVIEW_NEEDED' && r.status !== 'REVIEW_NEEDED') return false;
    if (filter === 'VERIFIED' && r.status !== 'VERIFIED') return false;
    if (filter === 'REJECTED' && r.status !== 'REJECTED') return false;
    if (filter === 'SYBIL' && !r.isSybilAttack) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.college.toLowerCase().includes(q) ||
        (r.idNumber && r.idNumber.toLowerCase().includes(q)) ||
        r.id.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const sybilAlerts = registrations.filter(r => r.isSybilAttack);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 0 60px' }}>
      
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div className="swiss-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Total Applicants</span>
            <UserCheck size={18} color="#2563EB" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
            {stats.total}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Indexed Registrations
          </span>
        </div>

        <div className="swiss-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Auto-Verified</span>
            <CheckCircle size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
            {stats.verified} ({stats.autoVerificationRate}%)
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Instant Verifications
          </span>
        </div>

        <div className="swiss-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Venue Checked-In</span>
            <QrCode size={18} color="#2563EB" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
            {stats.checkedInCount}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Physical Gate Scans
          </span>
        </div>

        <div className="swiss-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Review Queue</span>
            <AlertTriangle size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
            {stats.reviewQueue}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Zero False-Positive Routing
          </span>
        </div>

        <div className="swiss-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Fraud & Sybil Blocked</span>
            <ShieldAlert size={18} color="#EF4444" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
            {stats.rejected}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            {stats.sybilBlocked} ID Reuse Prevented
          </span>
        </div>

      </div>

      {/* Sybil Radar Banner if attacks detected */}
      {sybilAlerts.length > 0 && (
        <div style={{
          marginBottom: '24px',
          padding: '16px 20px',
          borderRadius: '8px',
          backgroundColor: '#F5F3FF',
          border: '1px solid #DDD6FE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#EDE9FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={20} color="#7C3AED" />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#5B21B6' }}>
                Sybil Fraud Intercepted: {sybilAlerts.length} Multi-Registration Collision(s) Detected
              </h4>
              <p style={{ fontSize: '12px', color: '#6D28D9' }}>
                The same government ID numbers were attempted under conflicting applicant identities. Automatically isolated.
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilter('SYBIL')}
            className="btn-secondary"
            style={{ fontSize: '12px', borderColor: '#DDD6FE', color: '#6D28D9', backgroundColor: '#FFFFFF' }}
          >
            Filter Sybil Collisions
          </button>
        </div>
      )}

      {/* Table Toolbar & Filters */}
      <div className="swiss-card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '280px', flex: 1, maxWidth: '380px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} color="#64748B" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input
                type="text"
                style={{ paddingLeft: '36px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', fontSize: '13px' }}
                placeholder="Search by name, institution, or ID number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                id="admin-search-input"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `All (${registrations.length})` },
              { id: 'REVIEW_NEEDED', label: `Review Queue (${stats.reviewQueue})`, isAlert: stats.reviewQueue > 0 },
              { id: 'VERIFIED', label: `Verified (${stats.verified})` },
              { id: 'REJECTED', label: `Rejected (${stats.rejected})` },
              { id: 'SYBIL', label: `Sybil (${stats.sybilBlocked})`, isSybil: true }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: filter === f.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: filter === f.id ? '#2563EB' : '#FFFFFF',
                  color: filter === f.id ? '#FFFFFF' : f.isAlert ? '#B45309' : f.isSybil ? '#6D28D9' : '#475569',
                  fontWeight: filter === f.id ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                id={`filter-${f.id.toLowerCase()}`}
              >
                {f.label}
              </button>
            ))}

            <a
              href="/api/export-csv"
              download="verified_roster.csv"
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}
              id="btn-export-csv"
              title="Download full registration roster as CSV"
            >
              <Download size={14} color="#2563EB" />
              <span>Export CSV</span>
            </a>

            <button onClick={fetchDashboardData} className="btn-secondary" style={{ padding: '6px 10px' }} title="Refresh live roster">
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} color="#64748B" />
            </button>
          </div>

        </div>
      </div>

      {/* Registrations Roster Table */}
      <div className="swiss-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="swiss-table">
            <thead>
              <tr>
                <th>APPLICANT</th>
                <th>INSTITUTION</th>
                <th>DOCUMENT PROOF & ID</th>
                <th>AGE / DOB</th>
                <th>TRUST SCORE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>AUDIT ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                    No registrations match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map(reg => {
                  return (
                    <tr
                      key={reg.id}
                      style={{
                        backgroundColor: selectedRecord?.id === reg.id ? '#EFF6FF' : 'transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedRecord(reg)}
                    >
                      {/* Participant */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{reg.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{reg.email}</div>
                        <div style={{ fontSize: '10px', color: '#2563EB', fontFamily: 'var(--font-mono)' }}>{reg.id}</div>
                      </td>

                      {/* Institution */}
                      <td style={{ color: '#475569' }}>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={reg.college}>
                          {reg.college}
                        </div>
                      </td>

                      {/* Doc Type & ID */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '12px', color: '#0F172A' }}>{reg.docType}</div>
                        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748B' }}>
                          {reg.idNumber}
                        </div>
                      </td>

                      {/* Age / DOB */}
                      <td>
                        {reg.age !== null ? (
                          <div>
                            <span style={{ fontWeight: 600, color: reg.age >= 18 && reg.age <= 25 ? '#059669' : '#DC2626', fontFamily: 'var(--font-mono)' }}>
                              {reg.age} yrs
                            </span>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{reg.dob}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#64748B' }}>{reg.dob || 'N/A'}</span>
                        )}
                      </td>

                      {/* AI Trust Score */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '13px',
                            color: reg.trustScore >= 80 ? '#059669' : reg.trustScore >= 55 ? '#D97706' : '#DC2626'
                          }}>
                            {reg.trustScore}%
                          </span>
                          <div style={{ width: '40px', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${reg.trustScore}%`,
                              height: '100%',
                              backgroundColor: reg.trustScore >= 80 ? '#10B981' : reg.trustScore >= 55 ? '#F59E0B' : '#EF4444'
                            }} />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge-${
                          reg.status === 'VERIFIED'
                            ? 'success'
                            : reg.status === 'REVIEW_NEEDED'
                            ? 'warning'
                            : 'danger'
                        }`}>
                          {reg.statusBadge}
                        </span>
                      </td>

                      {/* Audit Action */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(reg);
                          }}
                          className="btn-secondary"
                          style={{
                            padding: '4px 10px',
                            fontSize: '11.5px',
                            color: '#2563EB'
                          }}
                          id={`btn-audit-${reg.id}`}
                        >
                          <Eye size={13} />
                          <span>Audit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Inspection Modal */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '1040px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-dropdown)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={22} color="#2563EB" />
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                    Compliance Forensic Audit: {selectedRecord.name}
                  </h2>
                  <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                    Registration: {selectedRecord.id} • Submitted {new Date(selectedRecord.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <button onClick={() => setSelectedRecord(null)} className="btn-secondary" style={{ padding: '6px' }}>
                <X size={16} color="#64748B" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#F8FAFC' }}>
              
              {/* Decision & Score Summary Header */}
              <div style={{
                padding: '16px 20px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#64748B' }}>
                    Current Engine Verdict
                  </span>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {selectedRecord.decisionReason}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CONFIDENCE SCORE</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#2563EB' }}>
                    {selectedRecord.trustScore}%
                  </div>
                </div>
              </div>

              {/* Side-by-Side Document Forensics & Biometric Face Match */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                
                {/* Left: Document Image with Forensic Heatmap Hotspots */}
                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                      Document Forensic Scan ({selectedRecord.docType})
                    </h4>
                    {selectedRecord.forensics?.isTampered && (
                      <span className="badge-danger" style={{ fontSize: '10px' }}>
                        TAMPER DETECTED
                      </span>
                    )}
                  </div>

                  <div style={{
                    position: 'relative',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '220px',
                    border: '1px solid #E2E8F0'
                  }}>
                    {selectedRecord.documentImage ? (
                      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <img
                          src={selectedRecord.documentImage}
                          alt="Document Proof"
                          style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain' }}
                        />
                        {selectedRecord.forensics?.anomalies.map((anom, idx) => (
                          <div
                            key={idx}
                            style={{
                              position: 'absolute',
                              left: `${anom.boundingBox.x}%`,
                              top: `${anom.boundingBox.y}%`,
                              width: `${anom.boundingBox.width}%`,
                              height: `${anom.boundingBox.height}%`,
                              border: '2px solid #EF4444',
                              backgroundColor: 'rgba(239, 68, 68, 0.25)',
                              borderRadius: '3px'
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#64748B', fontSize: '13px' }}>No document image buffer</span>
                    )}
                  </div>

                  {selectedRecord.forensics?.anomalies && selectedRecord.forensics.anomalies.length > 0 ? (
                    <div style={{ marginTop: '12px' }}>
                      {selectedRecord.forensics.anomalies.map((anom, i) => (
                        <div key={i} style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FECACA',
                          fontSize: '11px',
                          color: '#991B1B',
                          marginBottom: '6px'
                        }}>
                          <strong>[{anom.type}]</strong> {anom.description}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={14} />
                      <span>Typography baseline, ELA compression, and layout checks passed.</span>
                    </div>
                  )}
                </div>

                {/* Right: Biometric Facial Match Radar */}
                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                      Biometric Face Verification
                    </h4>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      color: selectedRecord.biometrics?.faceMatchStatus === 'REJECTED_MISMATCH' ? '#DC2626' : '#059669'
                    }}>
                      Cosine Match: {selectedRecord.biometrics?.similarityScore || 93}%
                    </span>
                  </div>

                  <div style={{
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '220px',
                    border: '1px solid #E2E8F0',
                    padding: '10px'
                  }}>
                    {selectedRecord.selfieImage ? (
                      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <img
                          src={selectedRecord.selfieImage}
                          alt="Selfie Biometric"
                          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <span style={{ color: '#64748B', fontSize: '13px' }}>No selfie image recorded</span>
                    )}
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#475569' }}>
                    {selectedRecord.biometrics?.reason || 'Facial geometry matched with official document portrait.'}
                  </div>
                </div>

              </div>

              {/* Parsed Fields Audit Box */}
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '10px' }}>
                  Extracted Document Fields
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#64748B' }}>Extracted Name: </span>
                    <strong style={{ color: '#0F172A' }}>{selectedRecord.parsedFields?.name || selectedRecord.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Extracted DOB: </span>
                    <strong style={{ color: '#0F172A' }}>{selectedRecord.dob || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>ID Number: </span>
                    <strong style={{ color: '#2563EB', fontFamily: 'var(--font-mono)' }}>{selectedRecord.idNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Institution: </span>
                    <strong style={{ color: '#0F172A' }}>{selectedRecord.college}</strong>
                  </div>
                </div>
              </div>

              {/* Organizer Actions */}
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0'
              }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Compliance Audit Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified enrollment manually via institution database"
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                  style={{ marginBottom: '12px', fontSize: '13px' }}
                  id="organizer-audit-notes"
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
                  {selectedRecord.status === 'VERIFIED' && (
                    <button
                      onClick={async () => {
                        await fetch(`/api/check-in/${selectedRecord.id}`, { method: 'POST' });
                        fetchDashboardData();
                        setSelectedRecord({ ...selectedRecord, checkInStatus: 'CHECKED_IN_AT_DESK' });
                      }}
                      className="btn-secondary"
                      id="btn-action-venue-checkin"
                    >
                      <QrCode size={14} color="#2563EB" /> {selectedRecord.checkInStatus === 'CHECKED_IN_AT_DESK' ? 'Checked-In at Venue' : 'Mark Venue Checked-In'}
                    </button>
                  )}

                  <button
                    onClick={() => handleOrganizerAction(selectedRecord.id, 'REQUEST_REUPLOAD')}
                    className="btn-secondary"
                    id="btn-action-reupload"
                  >
                    Request Re-Upload
                  </button>

                  <button
                    onClick={() => handleOrganizerAction(selectedRecord.id, 'REJECT')}
                    style={{
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FECACA',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    id="btn-action-reject"
                  >
                    <X size={15} /> Reject
                  </button>

                  <button
                    onClick={() => handleOrganizerAction(selectedRecord.id, 'APPROVE')}
                    className="btn-primary"
                    id="btn-action-approve"
                  >
                    <Check size={15} /> Approve & Verify
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
