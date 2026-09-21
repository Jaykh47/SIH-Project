import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuthContext';
import {
  Bell, AlertTriangle, ShieldCheck, CheckCircle2,
  Filter, Check, X, ChevronRight, Eye, RefreshCw
} from 'lucide-react';

export default function AlertsPage() {
  const navigate = useNavigate();
  const { user, isOfficer } = useAuth();

  const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'quality'
  const [aiFilter, setAiFilter] = useState('pending'); // 'pending' | 'verified' | 'dismissed' | 'all'
  const [qualityFilter, setQualityFilter] = useState('open'); // 'open' | 'resolved' | 'dismissed' | 'all'

  const [summary, setSummary] = useState(null);
  const [aiAlerts, setAiAlerts] = useState([]);
  const [qualityAlerts, setQualityAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal / action state
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [actionType, setActionType] = useState(''); // 'verified' | 'dismissed' | 'escalated' | 'resolved'
  const [actionRemarks, setActionRemarks] = useState('');
  const [actionError, setActionError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, aiRes, qRes] = await Promise.all([
        alertsAPI.summary(),
        alertsAPI.ai(aiFilter),
        alertsAPI.quality(qualityFilter)
      ]);
      setSummary(sumRes.data?.data || {});
      setAiAlerts(aiRes.data?.data || []);
      setQualityAlerts(qRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [aiFilter, qualityFilter]);

  const handleAction = async (e) => {
    e.preventDefault();
    if (!selectedAlert || !actionType) return;
    setActionLoading(true);
    setActionError('');

    try {
      if (selectedAlert.alert_id && selectedAlert.change_type) {
        // AI alert
        await alertsAPI.verifyAi(selectedAlert.alert_id, actionType, actionRemarks);
      } else {
        // Quality alert
        await alertsAPI.resolveQuality(selectedAlert.alert_id, actionType, actionRemarks);
      }
      setSelectedAlert(null);
      setActionRemarks('');
      await loadData();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const s = (severity || 'medium').toLowerCase();
    return <span className={`badge badge-${s}`}>{s}</span>;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
      case 'open':
        return <span className="badge badge-pending">{status}</span>;
      case 'verified':
      case 'resolved':
        return <span className="badge badge-success">{status}</span>;
      case 'dismissed':
        return <span className="badge badge-neutral">dismissed</span>;
      case 'escalated':
        return <span className="badge badge-critical">escalated</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div style={{ flex: 1, width: '100%', height: '100%', overflowY: 'auto', padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#ecfdf5', border: '1px solid #a7f3d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Bell size={20} color="#059669" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                Anomaly & Integrity Alerts
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                Human-in-the-loop verification center for AI satellite change detections and inter-departmental data conflicts.
              </p>
            </div>
          </div>
        </div>

        <button
          className="btn btn-ghost"
          onClick={loadData}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* HITL Governance Banner */}
      <div style={{
        background: 'rgba(52, 211, 153, 0.12)',
        border: '1px solid rgba(52, 211, 153, 0.25)',
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: 'var(--shadow-card)'
      }}>
        <ShieldCheck size={28} color="#059669" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-brand-500)' }}>SIH Explainable AI Governance Policy:</strong>{' '}
          Computer vision models and automated cross-checks flag candidate anomalies.
          By statutory mandate, <strong style={{ color: 'var(--color-text-primary)' }}>no legal title, land record, or registry is altered automatically</strong>.
          Every alert requires manual officer verification with logged audit justifications.
        </div>
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="section-label">Pending AI Alerts</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
            {summary?.ai_alerts?.pending ?? 0}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Satellite change candidates</div>
        </div>

        <div className="stat-card">
          <div className="section-label">Verified AI Detections</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#059669', marginTop: 4 }}>
            {summary?.ai_alerts?.verified ?? 0}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Confirmed encroachments/conversions</div>
        </div>

        <div className="stat-card">
          <div className="section-label">Open Quality Conflicts</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>
            {Object.entries(summary?.quality_alerts || {})
              .filter(([k]) => k.endsWith('_open'))
              .reduce((acc, [, val]) => acc + val, 0)}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Cross-department discrepancies</div>
        </div>

        <div className="stat-card">
          <div className="section-label">Total Action Required</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#047857', marginTop: 4 }}>
            {summary?.total_pending ?? 0}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Awaiting officer sign-off</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('ai')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: activeTab === 'ai' ? 700 : 500,
            cursor: 'pointer',
            color: activeTab === 'ai' ? 'var(--color-brand-500)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'ai' ? '3px solid var(--color-brand-500)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s'
          }}
        >
          <AlertTriangle size={16} color={activeTab === 'ai' ? 'var(--color-brand-500)' : 'var(--color-text-muted)'} />
          AI Satellite Alerts ({aiAlerts.length})
        </button>

        <button
          onClick={() => setActiveTab('quality')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: activeTab === 'quality' ? 700 : 500,
            cursor: 'pointer',
            color: activeTab === 'quality' ? 'var(--color-brand-500)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'quality' ? '3px solid var(--color-brand-500)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s'
          }}
        >
          <ShieldCheck size={16} color={activeTab === 'quality' ? 'var(--color-brand-500)' : 'var(--color-text-muted)'} />
          Data Quality Discrepancies ({qualityAlerts.length})
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} color="#64748b" />
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Filter Status:</span>
          {activeTab === 'ai' ? (
            ['pending', 'verified', 'dismissed', 'all'].map(status => (
              <button
                key={status}
                onClick={() => setAiFilter(status)}
                className={`btn ${aiFilter === status ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '4px 12px', fontSize: 12, textTransform: 'capitalize' }}
              >
                {status}
              </button>
            ))
          ) : (
            ['open', 'resolved', 'dismissed', 'all'].map(status => (
              <button
                key={status}
                onClick={() => setQualityFilter(status)}
                className={`btn ${qualityFilter === status ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '4px 12px', fontSize: 12, textTransform: 'capitalize' }}
              >
                {status}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Alerts Content */}
      {loading ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🛰️</div>
          <div>Loading verified alerts…</div>
        </div>
      ) : activeTab === 'ai' ? (
        /* AI Alerts Table */
        aiAlerts.length === 0 ? (
          <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>No AI alerts matching this filter</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>All detected anomalies in this category have been processed.</div>
          </div>
        ) : (
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ULPIN / Parcel</th>
                  <th>Anomaly Type</th>
                  <th>Confidence</th>
                  <th>Detection Date</th>
                  <th>Status</th>
                  <th>Assigned / Verified By</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {aiAlerts.map(alert => (
                  <tr key={alert.alert_id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#059669', cursor: 'pointer' }}
                        onClick={() => navigate(`/parcels/${alert.ulpin}`)}>
                        {alert.ulpin}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {alert.village_name || 'Village'} • {alert.land_use}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {alert.change_type?.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {alert.details?.description || 'Satellite sensor anomaly flagged.'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          flex: 1, height: 6, width: 60, background: 'var(--color-surface-700)', borderRadius: 3, overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(alert.confidence || 0) * 100}%`,
                            height: '100%',
                            background: alert.confidence > 0.8 ? '#dc2626' : '#d97706',
                            borderRadius: 3
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {Math.round((alert.confidence || 0) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {alert.detected_at ? new Date(alert.detected_at).toLocaleDateString() : '—'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {alert.detected_at ? new Date(alert.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>
                    <td>{getStatusBadge(alert.status)}</td>
                    <td>
                      {alert.verified_by_name ? (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#064e3b' }}>{alert.verified_by_name}</div>
                          <div style={{ fontSize: 10, color: '#64748b' }}>
                            {alert.verified_at ? new Date(alert.verified_at).toLocaleDateString() : ''}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#64748b' }}>Awaiting Review</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          className="btn btn-table-action"
                          onClick={() => navigate(`/parcels/${alert.ulpin}`)}
                          title="View parcel on map"
                        >
                          <Eye size={14} />
                        </button>

                        {alert.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-success"
                              style={{ padding: '4px 10px', fontSize: 12 }}
                              onClick={() => {
                                setSelectedAlert(alert);
                                setActionType('verified');
                              }}
                            >
                              <Check size={14} /> Verify
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '4px 10px', fontSize: 12 }}
                              onClick={() => {
                                setSelectedAlert(alert);
                                setActionType('dismissed');
                              }}
                            >
                              <X size={14} /> Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Data Quality Alerts Table */
        qualityAlerts.length === 0 ? (
          <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#064e3b' }}>No cross-department discrepancies found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Revenue, Registration, and Municipality databases are harmonized.</div>
          </div>
        ) : (
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ULPIN / Parcel</th>
                  <th>Severity</th>
                  <th>Discrepancy Description</th>
                  <th>Conflicting Departments</th>
                  <th>Status</th>
                  <th>Resolved By</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {qualityAlerts.map(alert => (
                  <tr key={alert.alert_id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#059669', cursor: 'pointer' }}
                        onClick={() => navigate(`/parcels/${alert.ulpin}`)}>
                        {alert.ulpin}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {alert.village_name || 'Village'}
                      </div>
                    </td>
                    <td>{getSeverityBadge(alert.severity)}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {alert.alert_type?.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {alert.description}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(alert.affected_departments || ['Revenue', 'Registration']).map((d, i) => (
                          <span key={i} className="badge badge-neutral" style={{ fontSize: 10 }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{getStatusBadge(alert.status)}</td>
                    <td>
                      {alert.resolved_by_name ? (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#064e3b' }}>{alert.resolved_by_name}</div>
                          <div style={{ fontSize: 10, color: '#64748b' }}>
                            {alert.resolved_at ? new Date(alert.resolved_at).toLocaleDateString() : ''}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#64748b' }}>Open Issue</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          className="btn btn-table-action"
                          onClick={() => navigate(`/parcels/${alert.ulpin}`)}
                          title="Inspect parcel"
                        >
                          <ChevronRight size={14} />
                        </button>

                        {alert.status === 'open' && (
                          <button
                            className="btn btn-success"
                            style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => {
                              setSelectedAlert(alert);
                              setActionType('resolved');
                            }}
                          >
                            <Check size={14} /> Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Verification / Resolution Modal */}
      {selectedAlert && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 20
        }}>
          <div className="glass-card" style={{
            background: 'var(--color-surface-800)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 520,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Officer Sign-Off: {actionType.toUpperCase()} Alert
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAction} style={{ padding: 20 }}>
              <div style={{
                background: 'var(--color-surface-700)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: 14,
                marginBottom: 16
              }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-brand)', fontWeight: 600 }}>Target Parcel:</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-brand-500)' }}>{selectedAlert.ulpin}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  {selectedAlert.change_type || selectedAlert.alert_type}
                </div>
              </div>

              {actionError && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 14
                }}>
                  {actionError}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-brand)', marginBottom: 6 }}>
                  Officer Reason / Justification Notes (Mandatory for SIH Audit Log):
                </label>
                <textarea
                  className="input"
                  rows={4}
                  required
                  placeholder="Enter detailed field verification notes or rationale for this determination..."
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setSelectedAlert(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${actionType === 'dismissed' ? 'btn-danger' : 'btn-primary'}`}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Recording Audit...' : `Confirm ${actionType.toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
