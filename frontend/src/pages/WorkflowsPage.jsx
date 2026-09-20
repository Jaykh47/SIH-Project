import React, { useState } from 'react';
import {
  Route, CheckCircle2, Clock, ArrowRight, ShieldCheck,
  FileText, Database, Server, RefreshCw, Send, Play, Terminal
} from 'lucide-react';

const INITIAL_STEPS = [
  { n: 1, label: 'Registration Submitted', sub: 'Registrar Department', status: 'complete', time: '28 Aug · 16:24', note: 'Citizen submitted deed with Aadhaar e-KYC' },
  { n: 2, label: 'Deed Validated',        sub: 'Digital Verification',  status: 'complete', time: '30 Aug · 11:10', note: 'Cryptographic deed hash matched land registry' },
  { n: 3, label: 'Mutation Review',       sub: 'Revenue Department',    status: 'active',   time: '31 Aug · 14:42', note: 'Revenue Officer reviewing boundary coordinates' },
  { n: 4, label: 'RoR & Khatian Update',  sub: 'Land Records Dept',     status: 'pending',  time: 'Est. 2 Working Days', note: 'Auto-generation of updated digital Khatian' },
  { n: 5, label: 'Property Tax Sync',     sub: 'Municipal Corporation', status: 'pending',  time: 'Est. 3 Working Days', note: 'WebHook trigger to update municipal assessment ledger' },
];

const INITIAL_LOGS = [
  'POST /api/v1/registration/submit { ulpin: "WB-DGP-00000013", type: "sale_deed" } -> 200 OK',
  'GET /api/v1/parcels/WB-DGP-00000013/unified -> 200 OK [Latency: 42ms]',
  'POST /api/v1/verification/cryptographic-hash -> 200 OK [SHA256 Match: e7b2...9a1f]',
  'EVENT: department.mutation.assigned -> Handled by RevenueOfficer:Ward-14',
  'INFO: Automated boundary check: 0.2% variance within legal threshold (±5%)',
];

export default function WorkflowsPage() {
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const [activeStepIndex, setActiveStepIndex] = useState(2); // Step 3 active by default
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleAdvanceStep = () => {
    if (activeStepIndex >= steps.length - 1) return;
    setIsSimulating(true);

    setTimeout(() => {
      const nextIdx = activeStepIndex + 1;
      const updated = steps.map((s, idx) => {
        if (idx < nextIdx) return { ...s, status: 'complete' };
        if (idx === nextIdx) return { ...s, status: 'active', time: 'Just now' };
        return { ...s, status: 'pending' };
      });

      setSteps(updated);
      setActiveStepIndex(nextIdx);

      const timestamp = new Date().toLocaleTimeString();
      const newLog = `EVENT [${timestamp}]: Workflow step advanced to "${steps[nextIdx].label}" -> 200 OK`;
      setLogs(prev => [newLog, ...prev]);
      setIsSimulating(false);
    }, 600);
  };

  const handleResetWorkflow = () => {
    setSteps(INITIAL_STEPS);
    setActiveStepIndex(2);
    setLogs(INITIAL_LOGS);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: 'rgba(5,150,105,0.12)', color: '#047857',
              padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
              Interoperability Engine
            </span>
            <span style={{
              background: '#e0f2fe', color: '#0284c7',
              padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
            }}>
              Live Simulation
            </span>
          </div>
          <h1 style={{ margin: '8px 0 4px', fontSize: 24, fontWeight: 800, color: 'var(--sb-800)', fontFamily: 'Outfit, sans-serif' }}>
            Inter-Department Workflow Integration
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            Cross-departmental pipeline linking Registration (IGRS) ➔ Mutation (Revenue) ➔ Property Tax (Municipal Corporation).
          </p>
        </div>

        {/* Simulation Controls */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleResetWorkflow}
            className="btn btn-secondary"
            style={{ fontSize: 13, gap: 6 }}
          >
            <RefreshCw size={14} /> Reset
          </button>
          <button
            onClick={handleAdvanceStep}
            disabled={isSimulating || activeStepIndex >= steps.length - 1}
            className="btn btn-primary"
            style={{ fontSize: 13, gap: 6 }}
          >
            <Play size={14} /> {isSimulating ? 'Processing…' : 'Advance Workflow Step →'}
          </button>
        </div>
      </div>

      {/* ── Visual 5-Step Pipeline Card ── */}
      <div style={{
        background: '#ffffff', border: '1px solid rgba(5,150,105,0.15)',
        borderRadius: 16, padding: '24px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Transaction Life-cycle
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              Title Transfer & Autonomous Multi-System Synchronization
            </h3>
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Stage {activeStepIndex + 1} of {steps.length}
          </div>
        </div>

        {/* Stepper Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 12 }}>
          {steps.map((s, idx) => {
            const isDone = s.status === 'complete';
            const isActive = s.status === 'active';

            return (
              <React.Fragment key={s.n}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: isActive ? '#ecfdf5' : isDone ? '#f8fafc' : '#ffffff',
                  border: `1.5px solid ${isActive ? '#10b981' : isDone ? '#a7f3d0' : '#e2e8f0'}`,
                  borderRadius: 12, padding: '10px 14px', minWidth: 175, flex: 1
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: isDone ? '#059669' : isActive ? '#10b981' : '#f1f5f9',
                    color: isDone || isActive ? '#ffffff' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, flexShrink: 0
                  }}>
                    {isDone ? '✓' : s.n}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#064e3b' : isDone ? '#0f172a' : '#64748b' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
                      {s.sub}
                    </div>
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <div style={{
                    width: 20, height: 2, flexShrink: 0,
                    background: idx < activeStepIndex ? '#10b981' : '#e2e8f0'
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Transaction Metadata Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12, marginTop: 20, paddingTop: 18, borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>ULPIN Identifier</span>
            <strong style={{ display: 'block', fontSize: 13, color: '#059669', fontFamily: 'monospace', marginTop: 3 }}>
              WB-DGP-00000013
            </strong>
          </div>
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Transaction ID</span>
            <strong style={{ display: 'block', fontSize: 13, color: '#0f172a', fontFamily: 'monospace', marginTop: 3 }}>
              TXN-2026-WB-884271
            </strong>
          </div>
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Started On</span>
            <strong style={{ display: 'block', fontSize: 13, color: '#0f172a', marginTop: 3 }}>
              28 Aug 2026 · 16:24
            </strong>
          </div>
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Statutory SLA</span>
            <strong style={{ display: 'block', fontSize: 13, color: '#047857', marginTop: 3 }}>
              2 Working Days Remaining
            </strong>
          </div>
        </div>
      </div>

      {/* ── Two Columns: Audit Trail + Live API Events ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Audit Trail */}
        <div style={{
          background: '#ffffff', border: '1px solid rgba(5,150,105,0.15)',
          borderRadius: 16, padding: '20px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: 'rgba(5,150,105,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldCheck size={18} color="#059669" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Immutable Audit Trail
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>
                Cryptographic transaction history and officer verification log
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.filter(s => s.status !== 'pending').map((s) => (
              <div key={s.n} style={{
                display: 'flex', gap: 12, paddingBottom: 12,
                borderBottom: '1px solid #f1f5f9'
              }}>
                <div style={{ minWidth: 80, fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                  {s.time}
                </div>
                <div>
                  <strong style={{ fontSize: 12, color: '#0f172a' }}>{s.label}</strong>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.note}</div>
                  <div style={{ fontSize: 10, color: '#047857', marginTop: 2, fontWeight: 600 }}>
                    {s.sub} · Verified ✓
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live M2M API Events Terminal */}
        <div style={{
          background: '#0c1823', border: '1px solid #1f3244',
          borderRadius: 16, padding: '20px 24px', color: '#e2e8f0',
          display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={16} color="#34d399" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
                Machine-to-Machine Event Bus
              </span>
            </div>
            <span style={{ fontSize: 10, color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} /> Live Bus
            </span>
          </div>

          <div style={{
            flex: 1, background: '#070f16', borderRadius: 10, padding: 14,
            fontFamily: 'monospace', fontSize: 11, color: '#86efac',
            overflowY: 'auto', maxHeight: 220, display: 'flex', flexDirection: 'column', gap: 8
          }}>
            {logs.map((log, idx) => (
              <div key={idx} style={{ lineHeight: 1.5, wordBreak: 'break-all' }}>
                <span style={{ color: '#64748b' }}>$</span> {log}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: '#94a3b8' }}>
            ⚡ Interoperable microservices exchanging real-time webhooks upon deed registration.
          </div>
        </div>
      </div>
    </div>
  );
}
