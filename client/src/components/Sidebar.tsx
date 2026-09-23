import React from 'react';
import { 
  UserCheck, ShieldCheck, Sliders, 
  RotateCcw, Sparkles, KeyRound,
  Shield, ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'participant' | 'organizer';
  setActiveTab: (tab: 'participant' | 'organizer') => void;
  reviewCount: number;
  onOpenRules: () => void;
  onOpenAiConfig: () => void;
  onResetDemo: () => void;
  onToggleTestVectors: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  reviewCount,
  onOpenRules,
  onOpenAiConfig,
  onResetDemo,
  onToggleTestVectors
}) => {
  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 18px',
      minHeight: '100vh'
    }}>
      
      {/* Swiss FinTech Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingBottom: '20px',
        marginBottom: '20px',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          backgroundColor: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
        }}>
          <Shield size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
              FinTrust<span style={{ color: '#2563EB' }}>.ai</span>
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
            Identity Trust Gateway
          </p>
        </div>
      </div>

      {/* Main Navigation Section */}
      <div style={{
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#64748B',
        marginBottom: '8px',
        paddingLeft: '4px'
      }}>
        Operations
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          onClick={() => setActiveTab('participant')}
          id="tab-participant"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: '8px',
            border: activeTab === 'participant' ? '1px solid #BFDBFE' : '1px solid transparent',
            backgroundColor: activeTab === 'participant' ? '#EFF6FF' : 'transparent',
            color: activeTab === 'participant' ? '#2563EB' : '#475569',
            fontWeight: activeTab === 'participant' ? 600 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={18} color={activeTab === 'participant' ? '#2563EB' : '#64748B'} />
            <span>Applicant Portal</span>
          </div>
          {activeTab === 'participant' && <ChevronRight size={16} color="#2563EB" />}
        </button>

        <button
          onClick={() => setActiveTab('organizer')}
          id="tab-organizer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: '8px',
            border: activeTab === 'organizer' ? '1px solid #BFDBFE' : '1px solid transparent',
            backgroundColor: activeTab === 'organizer' ? '#EFF6FF' : 'transparent',
            color: activeTab === 'organizer' ? '#2563EB' : '#475569',
            fontWeight: activeTab === 'organizer' ? 600 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={18} color={activeTab === 'organizer' ? '#2563EB' : '#64748B'} />
            <span>Compliance Desk</span>
          </div>
          {reviewCount > 0 ? (
            <span style={{
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FECACA',
              padding: '2px 7px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700
            }}>
              {reviewCount}
            </span>
          ) : activeTab === 'organizer' ? (
            <ChevronRight size={16} color="#2563EB" />
          ) : null}
        </button>
      </nav>

      {/* Evaluation & Tools Section */}
      <div style={{
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#64748B',
        marginTop: '28px',
        marginBottom: '8px',
        paddingLeft: '4px'
      }}>
        Compliance Tools
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          onClick={onToggleTestVectors}
          id="btn-sidebar-scenarios"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid transparent',
            backgroundColor: 'transparent',
            color: '#475569',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#2563EB" />
            <span>Test Vectors</span>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            border: '1px solid #BFDBFE'
          }}>
            8 Vectors
          </span>
        </button>

        <button
          onClick={onOpenRules}
          id="btn-sidebar-rules"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid transparent',
            backgroundColor: 'transparent',
            color: '#475569',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <Sliders size={18} color="#64748B" />
          <span>Eligibility Policy</span>
        </button>

        <button
          onClick={onOpenAiConfig}
          id="btn-sidebar-aiconfig"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid transparent',
            backgroundColor: 'transparent',
            color: '#475569',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <KeyRound size={18} color="#64748B" />
          <span>API Key & Engine</span>
        </button>
      </div>

      {/* System Status & Reset Demo */}
      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
        
        {/* Institutional Trust Badge */}
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
            }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
              Trust Engine Online
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#64748B' }}>
            Forensic Vision & Sybil Guard
          </p>
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          id="btn-sidebar-reset"
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: '#FFFFFF',
            color: '#64748B',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F8FAFC';
            e.currentTarget.style.color = '#0F172A';
            e.currentTarget.style.borderColor = '#CBD5E1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.color = '#64748B';
            e.currentTarget.style.borderColor = '#E2E8F0';
          }}
          title="Reset registrations to initial seed state"
        >
          <RotateCcw size={14} />
          <span>Reset Demo Records</span>
        </button>

      </div>
    </aside>
  );
};
