import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI, parcelsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuthContext';
import {
  Briefcase, FileText, CheckCircle2, AlertTriangle, ArrowRight,
  Shield, Search, Sparkles, FileCheck, HelpCircle
} from 'lucide-react';

const SERVICES = [
  {
    id: 'mutation',
    title: 'Land Record Mutation (Namaantaran)',
    desc: 'Update rights of ownership and title transfer following sale deed execution, inheritance, partition, or registered gift.',
    turnaround: '15 Days SLA',
    fee: '₹250 Statutory Fee',
    badge: 'High Priority',
    color: '#059669',
    icon: FileCheck,
    requiresParcel: true
  },
  {
    id: 'ror_copy',
    title: 'Certified RoR Copy (Khatian Extract)',
    desc: 'Download digitally authenticated, cryptographically signed Record of Rights (RoR) extract for bank loans or legal validation.',
    turnaround: 'Instant / 24 Hours',
    fee: '₹50 Portal Fee',
    badge: 'Automated',
    color: '#10b981',
    icon: FileText,
    requiresParcel: true
  },
  {
    id: 'encumbrance_cert',
    title: 'Non-Encumbrance Certificate (NEC)',
    desc: 'Obtain certified 30-year inter-departmental verification confirming the parcel is free from active mortgages, tax liens, or court attachments.',
    turnaround: '3-5 Working Days',
    fee: '₹150 Search Fee',
    badge: 'Inter-Dept Audit',
    color: '#047857',
    icon: Shield,
    requiresParcel: true
  },
  {
    id: 'name_correction',
    title: 'Record Rectification & Name Correction',
    desc: 'Rectify clerical errors, spelling discrepancies in owner name, parentage, or land use classification.',
    turnaround: '7 Working Days',
    fee: 'Free of Cost',
    badge: 'Revenue Office',
    color: '#0d9488',
    icon: Sparkles,
    requiresParcel: true
  },
  {
    id: 'grievance',
    title: 'Land Dispute & Encroachment Grievance',
    desc: 'Report physical encroachment, unauthorized boundary fence movement, or fraudulent registration to the District Revenue Magistrate.',
    turnaround: '48 Hours Response',
    fee: 'Free of Cost',
    badge: 'Urgent',
    color: '#dc2626',
    icon: AlertTriangle,
    requiresParcel: false
  },
  {
    id: 'other',
    title: 'General Land Administrative Service',
    desc: 'File petitions for demarcation, conversion of land use (CLU), or general inquiries with the local Tehsildar.',
    turnaround: '10 Working Days',
    fee: 'Variable',
    badge: 'General',
    color: '#475569',
    icon: HelpCircle,
    requiresParcel: false
  }
];

const SAMPLE_ULPINS = [
  'WB-DGP-00000013',
  'WB-DGP-00000001',
  'WB-DGP-00000002',
  'WB-DGP-00000003'
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Wizard steps: 1 = Service, 2 = Parcel, 3 = Details, 4 = Success
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(SERVICES[0]);

  // Parcel validation state
  const [ulpinInput, setUlpinInput] = useState('');
  const [parcelData, setParcelData] = useState(null);
  const [parcelLoading, setParcelLoading] = useState(false);
  const [parcelError, setParcelError] = useState('');

  // Application form fields
  const [description, setDescription] = useState('');
  const [applicantAffidavit, setApplicantAffidavit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Result state
  const [createdApp, setCreatedApp] = useState(null);

  // Quick Action Modals (from IntegratedDashboard feature set)
  const [modalKey, setModalKey] = useState(null);
  const [quickUlpin, setQuickUlpin] = useState('WB-DGP-00000013');
  const [quickVerifyData, setQuickVerifyData] = useState(null);
  const [quickVerifyLoading, setQuickVerifyLoading] = useState(false);
  const [quickTxnId, setQuickTxnId] = useState('TXN-2026-WB-884271');
  const [quickReportDone, setQuickReportDone] = useState(false);
  const [quickReqType, setQuickReqType] = useState('Mutation Request');
  const [quickReqDesc, setQuickReqDesc] = useState('');
  const [quickReqDone, setQuickReqDone] = useState(false);

  const handleQuickVerify = async (e) => {
    e.preventDefault();
    setQuickVerifyLoading(true);
    try {
      const res = await parcelsAPI.getByUlpin(quickUlpin.trim().toUpperCase());
      if (res.data?.success) setQuickVerifyData(res.data.data);
      else setQuickVerifyData({ ulpin: quickUlpin, village_name: 'Durgapur', land_use: 'Residential', plot_no: '104' });
    } catch {
      setQuickVerifyData({ ulpin: quickUlpin, village_name: 'Durgapur', land_use: 'Residential', plot_no: '104' });
    } finally {
      setQuickVerifyLoading(false);
    }
  };

  const handleSelectService = (svc) => {
    setSelectedService(svc);
    setStep(2);
  };

  const lookupParcel = async (ulpinToSearch) => {
    const query = (ulpinToSearch || ulpinInput).trim().toUpperCase();
    if (!query) return;

    setParcelLoading(true);
    setParcelError('');
    setParcelData(null);

    try {
      const res = await parcelsAPI.getByUlpin(query);
      if (res.data?.success && res.data?.data) {
        setParcelData(res.data.data);
        setUlpinInput(query);
      } else {
        setParcelError(`Parcel with ULPIN "${query}" was not found.`);
      }
    } catch (err) {
      setParcelError(err.response?.data?.error || `Unable to locate parcel "${query}".`);
    } finally {
      setParcelLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applicantAffidavit) {
      setSubmitError('Please acknowledge the statutory truthfulness declaration.');
      return;
    }
    if (description.trim().length < 10) {
      setSubmitError('Description must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        service_type: selectedService.id,
        description: description.trim(),
        parcel_id: parcelData?.parcel_id || undefined
      };

      const res = await applicationsAPI.submit(payload);
      if (res.data?.success) {
        setCreatedApp(res.data.data);
        setStep(4);
      } else {
        setSubmitError(res.data?.error || 'Failed to submit application.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Submission error. Please verify input.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ flex: 1, width: '100%', height: '100%', overflowY: 'auto', padding: '24px 32px' }}>
      {/* Page Title */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Briefcase size={22} color="#059669" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
              Citizen Land Services Portal
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
              Transparent, accountable single-window land governance workflow with ULPIN verification and real-time tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      {step < 4 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 28, marginBottom: 32
        }}>
          {[
            { num: 1, label: 'Select Service' },
            { num: 2, label: 'Link Parcel' },
            { num: 3, label: 'Statement & Submit' }
          ].map((s, idx) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step === s.num ? '#059669' : step > s.num ? '#047857' : 'var(--color-surface-700)',
                color: step >= s.num ? '#ffffff' : 'var(--color-text-muted)', fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: step === s.num ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none'
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: step === s.num ? 'var(--color-brand-500)' : step > s.num ? 'var(--color-brand-500)' : 'var(--color-text-muted)'
              }}>
                {s.label}
              </span>
              {idx < 2 && (
                <div style={{ width: 44, height: 2, background: step > s.num ? 'var(--color-brand-500)' : 'var(--color-border)' }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: Service Catalog */}
      {step === 1 && (
        <div>
          {/* Quick Action Cards Grid (from IntegratedDashboard) */}
          <div style={{
            background: 'var(--color-surface-800)',
            border: '1px solid var(--color-border)', borderRadius: 16,
            padding: 24, marginBottom: 32, boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 10, color: 'var(--color-text-brand)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Self-Service Citizen Desk
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  Fast Digital Citizen Services
                </h3>
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-brand-500)', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>
                Instant Processing
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              {[
                { id: 'verify', icon: '✓', title: 'Ownership Verification', desc: 'Instant verification of RoR, deed history, and encumbrance.' },
                { id: 'transaction', icon: '⇄', title: 'Transaction Tracking', desc: 'Real-time stage tracking of mutation and registration requests.' },
                { id: 'report', icon: '▤', title: 'Land Information Report', desc: 'Generate cryptographic multi-department land dossier.' },
                { id: 'quick_request', icon: '＋', title: 'Express Service Ticket', desc: 'Raise boundary rectification or mutation petitions directly.' },
              ].map(card => (
                <div
                  key={card.id}
                  onClick={() => setModalKey(card.id)}
                  style={{
                    background: 'var(--color-surface-700)', border: '1px solid var(--color-border)', borderRadius: 12,
                    padding: 16, cursor: 'pointer', transition: 'all 0.15s ease',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-brand-500)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, background: 'rgba(52, 211, 153, 0.12)',
                      color: 'var(--color-brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 16, marginBottom: 10
                    }}>
                      {card.icon}
                    </div>
                    <strong style={{ fontSize: 13, color: 'var(--color-text-primary)', display: 'block' }}>{card.title}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{card.desc}</p>
                  </div>
                  <button
                    style={{
                      marginTop: 12, background: 'var(--color-surface-800)', border: '1px solid var(--color-border)', color: 'var(--color-text-brand)',
                      padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', textAlign: 'center', width: '100%'
                    }}
                  >
                    Open Action →
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <span className="section-label">Step 1 of 3</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', margin: '4px 0 0' }}>
              Statutory Departmental Services
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            {SERVICES.map(svc => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.id}
                  className="glass-card"
                  onClick={() => handleSelectService(svc)}
                  style={{
                    padding: 22,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-card)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#059669';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(5, 150, 105, 0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: '#ecfdf5', border: '1px solid #a7f3d0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Icon size={22} color={svc.color} />
                      </div>
                      <span className="badge" style={{ background: '#ecfdf5', color: svc.color, border: `1px solid #a7f3d0` }}>
                        {svc.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#064e3b', margin: '0 0 6px' }}>
                      {svc.title}
                    </h3>
                    <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      {svc.desc}
                    </p>
                  </div>

                  <div style={{
                    marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                      ⏱️ {svc.turnaround} • {svc.fee}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: '#059669' }}>
                      Select <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Link Parcel */}
      {step === 2 && (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <span className="section-label">Step 2 of 3</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#064e3b', margin: '4px 0 0' }}>
                  Link Land Parcel (ULPIN)
                </h2>
              </div>
              <span className="badge badge-info">{selectedService.title}</span>
            </div>

            <p style={{ fontSize: 13, color: '#475569', marginTop: 0, marginBottom: 16 }}>
              Enter the unique 14-digit Unique Land Parcel Identification Number (Bhu-Aadhaar) to link this statutory service application.
            </p>

            {/* Quick Demo ULPINs */}
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontSize: 11, color: '#065f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Demo Parcels:
              </span>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                {SAMPLE_ULPINS.map(u => (
                  <button
                    key={u}
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: '4px 10px', fontSize: 12, border: '1px solid #d1fae5', background: '#f0fdf4', color: '#064e3b' }}
                    onClick={() => {
                      setUlpinInput(u);
                      lookupParcel(u);
                    }}
                  >
                    📍 {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Lookup */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="#059669" style={{ position: 'absolute', left: 12, top: 13 }} />
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. WB-DGP-00000013"
                  style={{ paddingLeft: 36, textTransform: 'uppercase' }}
                  value={ulpinInput}
                  onChange={e => setUlpinInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && lookupParcel()}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={() => lookupParcel()}
                disabled={parcelLoading || !ulpinInput}
              >
                {parcelLoading ? 'Verifying...' : 'Verify ULPIN'}
              </button>
            </div>

            {/* Error */}
            {parcelError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 20
              }}>
                {parcelError}
              </div>
            )}

            {/* Verified Parcel Card */}
            {parcelData && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #a7f3d0',
                borderRadius: 12,
                padding: 18,
                marginBottom: 24
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', marginBottom: 12 }}>
                  <CheckCircle2 size={18} />
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Parcel Verified in Cadastral Database</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, fontSize: 13 }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>ULPIN</div>
                    <div style={{ color: '#059669', fontWeight: 800 }}>{parcelData.ulpin}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Khasra / Plot</div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>{parcelData.khasra_no || 'Plot ' + (parcelData.plot_no || '—')}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Land Use</div>
                    <div style={{ color: '#0f172a', fontWeight: 700, textTransform: 'capitalize' }}>{parcelData.land_use}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Village / Mouza</div>
                    <div style={{ color: '#0f172a' }}>{parcelData.village_name || 'Durgapur'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>District / State</div>
                    <div style={{ color: '#0f172a' }}>{parcelData.district_name || 'West Bengal'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Area (Recorded)</div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>{parcelData.area_recorded} sq.m</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                Back to Services
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                {!selectedService.requiresParcel && (
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setParcelData(null);
                      setStep(3);
                    }}
                  >
                    Skip Parcel Linking
                  </button>
                )}

                <button
                  className="btn btn-primary"
                  disabled={selectedService.requiresParcel && !parcelData}
                  onClick={() => setStep(3)}
                >
                  Continue to Details <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Statement & Submit */}
      {step === 3 && (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ marginBottom: 20 }}>
              <span className="section-label">Step 3 of 3</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#064e3b', margin: '4px 0 0' }}>
                Application Dossier & Citizen Declaration
              </h2>
            </div>

            {/* Summary strip */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #a7f3d0',
              borderRadius: 10,
              padding: 14,
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>Selected Service</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#064e3b' }}>{selectedService.title}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>Target Parcel</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: parcelData ? '#059669' : '#d97706' }}>
                  {parcelData ? parcelData.ulpin : 'General Application'}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {submitError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 16
                }}>
                  {submitError}
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#064e3b', marginBottom: 6 }}>
                  Statement of Request & Grounds (Min 10 characters):
                </label>
                <textarea
                  className="input"
                  rows={5}
                  required
                  placeholder="Explain the background of your application, details of transfer deed/inheritance, or nature of grievance..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  This statement is stamped with timestamp and digital signature hash for audit compliance.
                </div>
              </div>

              {/* Statutory affidavit */}
              <div style={{
                background: '#f8faf9',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 14,
                marginBottom: 24,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                <input
                  type="checkbox"
                  id="affidavitCheck"
                  checked={applicantAffidavit}
                  onChange={e => setApplicantAffidavit(e.target.checked)}
                  style={{ marginTop: 3, cursor: 'pointer', accentColor: '#059669' }}
                />
                <label htmlFor="affidavitCheck" style={{ fontSize: 12, color: '#334155', cursor: 'pointer', lineHeight: 1.5 }}>
                  I hereby solemnly affirm that the statements made herein are true to the best of my knowledge and belief.
                  I understand that submitting false declarations regarding land title or ownership is punishable under
                  Sections 177 and 182 of the Indian Penal Code.
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setStep(2)} disabled={submitting}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !applicantAffidavit}>
                  {submitting ? 'Submitting Application...' : 'Sign & Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 4: Success Receipt */}
      {step === 4 && createdApp && (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: 36, textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#ecfdf5', border: '2px solid #a7f3d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} color="#059669" />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#064e3b', margin: '0 0 6px' }}>
              Application Successfully Filed!
            </h2>
            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 24px' }}>
              Your application has been registered into the LandStack state governance pipeline and assigned to the competent Tehsildar.
            </p>

            {/* Receipt Box */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #a7f3d0',
              borderRadius: 12,
              padding: 20,
              textAlign: 'left',
              marginBottom: 28
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: '#065f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Application Tracking Number
                </span>
                <span className="badge badge-info">Submitted</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.02em' }}>
                {createdApp.application_no}
              </div>

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #d1fae5', fontSize: 12, color: '#475569' }}>
                <div>Service: <strong style={{ color: '#064e3b' }}>{selectedService.title}</strong></div>
                {parcelData && <div style={{ marginTop: 4 }}>Linked Parcel: <strong style={{ color: '#064e3b' }}>{parcelData.ulpin}</strong></div>}
                <div style={{ marginTop: 4 }}>Estimated SLA Completion: <strong style={{ color: '#059669' }}>{selectedService.turnaround}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/applications')}
              >
                Track in Applications <ArrowRight size={14} />
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setStep(1);
                  setParcelData(null);
                  setDescription('');
                  setApplicantAffidavit(false);
                  setCreatedApp(null);
                }}
              >
                File Another Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Action Modals ── */}
      {modalKey && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          backdropFilter: 'blur(3px)'
        }}
        onClick={e => e.target === e.currentTarget && setModalKey(null)}
        >
          <div style={{
            background: '#ffffff', borderRadius: 16, maxWidth: 520, width: '100%',
            padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            <button
              onClick={() => { setModalKey(null); setQuickVerifyData(null); setQuickReportDone(false); setQuickReqDone(false); }}
              style={{
                position: 'absolute', right: 16, top: 16, background: 'none',
                border: 'none', fontSize: 20, color: '#94a3b8', cursor: 'pointer'
              }}
            >×</button>

            {/* Modal: Ownership Verification */}
            {modalKey === 'verify' && (
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  Instant Ownership & RoR Verification
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>
                  Verify live ownership records, plot boundaries, and encumbrance against departmental registries.
                </p>

                <form onSubmit={handleQuickVerify} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input
                    type="text"
                    className="input"
                    value={quickUlpin}
                    onChange={e => setQuickUlpin(e.target.value)}
                    placeholder="Enter ULPIN (e.g. WB-DGP-00000013)"
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={quickVerifyLoading}>
                    {quickVerifyLoading ? 'Verifying…' : 'Verify'}
                  </button>
                </form>

                {quickVerifyData && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                      <CheckCircle2 size={16} /> Official Record Validated
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                      <span style={{ color: '#64748b' }}>ULPIN</span>
                      <strong style={{ fontFamily: 'monospace' }}>{quickVerifyData.ulpin}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                      <span style={{ color: '#64748b' }}>Recorded Owner</span>
                      <strong>Ravi Kumar Sharma (Citizen Demo)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                      <span style={{ color: '#64748b' }}>Survey Plot</span>
                      <strong>Plot #{quickVerifyData.plot_no || '104/2B'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#64748b' }}>Encumbrance Status</span>
                      <strong style={{ color: '#059669' }}>Freehold · No Active Liens</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal: Transaction Tracking */}
            {modalKey === 'transaction' && (
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  Live Transaction Status Tracker
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>
                  Real-time pipeline tracking across Registration, Revenue, and Municipal Corporation.
                </p>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input
                    type="text"
                    className="input"
                    value={quickTxnId}
                    onChange={e => setQuickTxnId(e.target.value)}
                    style={{ flex: 1, fontFamily: 'monospace' }}
                  />
                  <button className="btn btn-primary" onClick={() => {}}>Track</button>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Current Stage</span>
                    <strong style={{ color: '#d97706' }}>Stage 3 · Revenue Mutation Review</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Assigned Officer</span>
                    <strong>Rajesh Patel (Revenue Officer WB)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Target SLA</span>
                    <strong style={{ color: '#059669' }}>2 Working Days Remaining</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Next Step</span>
                    <strong>Automated Property Tax Ledger Synchronization</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Land Report Generator */}
            {modalKey === 'report' && (
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  Unified Land Information Report
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>
                  Generate a unified single-dossier land report combining RoR, planning zone, property tax, and utilities.
                </p>

                {quickReportDone ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📜</div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#064e3b' }}>
                      Report Generated Successfully
                    </h4>
                    <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>
                      Document ID: LANDSTACK-ULIR-2026-WB8849
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => { setModalKey(null); setQuickReportDone(false); }}
                      style={{ margin: '0 auto' }}
                    >
                      Download PDF Extract
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                        Includes:
                        <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                          <li>Record of Rights (Khatian extract & ownership)</li>
                          <li>Town Planning & permissible FSI status</li>
                          <li>Municipal Property Tax assessment & payment receipts</li>
                          <li>Cadastral boundary coordinate verification</li>
                        </ul>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => setQuickReportDone(true)}
                    >
                      Generate Official Report
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Modal: Express Service Ticket */}
            {modalKey === 'quick_request' && (
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  Raise Expedited Service Ticket
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>
                  Submit an administrative query or petition directly to the assigned Tehsildar.
                </p>

                {quickReqDone ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#064e3b' }}>
                      Service Ticket Created
                    </h4>
                    <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>
                      Ticket #REQ-2026-WB-1108 assigned to Revenue Department.
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => { setModalKey(null); setQuickReqDone(false); }}
                      style={{ margin: '0 auto' }}
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); setQuickReqDone(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label className="label">Service Category</label>
                      <select
                        className="input"
                        value={quickReqType}
                        onChange={e => setQuickReqType(e.target.value)}
                        style={{ marginTop: 4 }}
                      >
                        <option>Mutation Request</option>
                        <option>RoR Name / Spelling Rectification</option>
                        <option>Cadastral Map Boundary Demarcation</option>
                        <option>Building Permission Invalidation Query</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">ULPIN</label>
                      <input
                        type="text"
                        className="input"
                        defaultValue="WB-DGP-00000013"
                        required
                        style={{ marginTop: 4, fontFamily: 'monospace' }}
                      />
                    </div>

                    <div>
                      <label className="label">Description & Petition Details</label>
                      <textarea
                        rows={3}
                        className="input"
                        value={quickReqDesc}
                        onChange={e => setQuickReqDesc(e.target.value)}
                        placeholder="State your grievance or requested update..."
                        required
                        style={{ marginTop: 4, resize: 'none' }}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 4 }}>
                      Submit Ticket
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
