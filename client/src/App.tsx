import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ParticipantPortal } from './components/ParticipantPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { TestCasesDrawer } from './components/TestCasesDrawer';
import { RulesModal } from './components/RulesModal';
import { AiConfigModal } from './components/AiConfigModal';
import { ShieldCheck, Calendar, Bell } from 'lucide-react';
import type { RegistrationRecord, TestVector } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'participant' | 'organizer'>('participant');
  const [testVectors, setTestVectors] = useState<TestVector[]>([]);
  const [selectedTestVector, setSelectedTestVector] = useState<TestVector | null>(null);
  const [isTestDrawerOpen, setIsTestDrawerOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);

  // Fetch initial test vectors and stats
  const fetchInitialData = async () => {
    try {
      const [vectorsRes, statsRes] = await Promise.all([
        fetch('/api/test-vectors'),
        fetch('/api/stats')
      ]);

      const vectorsData = await vectorsRes.json();
      const statsData = await statsRes.json();

      if (vectorsData.success) {
        setTestVectors(vectorsData.testVectors);
      }
      if (statsData.success) {
        setReviewCount(statsData.stats.reviewQueue);
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [refreshCounter]);

  const handleVerificationComplete = (_record: RegistrationRecord) => {
    setRefreshCounter(prev => prev + 1);
  };

  const handleSelectTestVector = (vector: TestVector) => {
    setSelectedTestVector(vector);
    setActiveTab('participant');
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset database to clean seed state?')) {
      try {
        await fetch('/api/reset-demo', { method: 'POST' });
        setSelectedTestVector(null);
        setRefreshCounter(prev => prev + 1);
      } catch (err) {
        console.error('Reset error:', err);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      flexDirection: 'row',
      width: '100%'
    }}>
      {/* Column 1: Clean Swiss FinTech Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reviewCount={reviewCount}
        onOpenRules={() => setIsRulesModalOpen(true)}
        onOpenAiConfig={() => setIsAiModalOpen(true)}
        onResetDemo={handleResetDemo}
        onToggleTestVectors={() => setIsTestDrawerOpen(true)}
      />

      {/* Column 2: Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC'
      }}>
        {/* Top Institutional Header */}
        <header style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '18px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#2563EB',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)'
              }}>
                TRACK PS-003
              </span>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                Institutional Verification Gateway
              </span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {activeTab === 'participant' ? 'Applicant Identity & Eligibility Portal' : 'Compliance & Fraud Audit Console'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#475569',
              backgroundColor: '#F8FAFC',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0'
            }}>
              <ShieldCheck size={15} color="#10B981" />
              <span>Engine Status: Secure</span>
              <span style={{ color: '#CBD5E1' }}>|</span>
              <Calendar size={14} color="#64748B" />
              <span>Active Cycle</span>
            </div>

            {reviewCount > 0 && (
              <button
                onClick={() => setActiveTab('organizer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  color: '#B45309',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title="Items waiting in compliance review queue"
              >
                <Bell size={14} />
                <span>{reviewCount} Review Needed</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab Body */}
        <div style={{ flex: 1, padding: '24px 36px' }}>
          {activeTab === 'participant' && (
            <ParticipantPortal
              onVerificationComplete={handleVerificationComplete}
              selectedTestVector={selectedTestVector}
              onClearTestVector={() => setSelectedTestVector(null)}
              onOpenTestVectors={() => setIsTestDrawerOpen(true)}
            />
          )}

          {activeTab === 'organizer' && (
            <AdminDashboard
              onRefreshTrigger={refreshCounter}
            />
          )}
        </div>

        {/* Clean Swiss FinTech Footer */}
        <footer style={{
          padding: '16px 36px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#64748B',
          backgroundColor: '#FFFFFF'
        }}>
          <p>
            <strong style={{ color: '#0F172A' }}>FinTrust.ai</strong> • Autonomous Multi-Modal Identity & Eligibility Verification Gateway
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#2563EB', fontWeight: 500 }}>
            FinTrust.ai Engine • Production v2.5.0
          </p>
        </footer>
      </div>

      {/* 8 Test Scenarios Drawer */}
      <TestCasesDrawer
        isOpen={isTestDrawerOpen}
        onClose={() => setIsTestDrawerOpen(false)}
        testVectors={testVectors}
        onSelectTestVector={handleSelectTestVector}
      />

      {/* Hackathon Rules Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        onRulesUpdated={() => setRefreshCounter(prev => prev + 1)}
      />

      {/* AI & AWS Cloud Architecture Modal */}
      <AiConfigModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

    </div>
  );
};

export default App;
