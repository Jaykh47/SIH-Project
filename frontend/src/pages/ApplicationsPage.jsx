import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applicationsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuthContext';
import {
  FileText, CheckCircle2,
  Filter, Plus, Search, Eye, X, RefreshCw
} from 'lucide-react';

const STATUS_STEPS = ['submitted', 'under_review', 'field_verification', 'approved'];

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isOfficer, isCitizen } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status update modal (Officer only)
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [newStatus, setNewStatus] = useState('under_review');
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const loadApplications = async () => {
    setLoading(true);
    try {
      if (isOfficer()) {
        const res = await applicationsAPI.all(statusFilter === 'all' ? undefined : statusFilter);
        setApplications(res.data?.data || []);
      } else {
        const res = await applicationsAPI.my();
        setApplications(res.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const viewDetails = async (appId) => {
    setDetailLoading(true);
    try {
      const res = await applicationsAPI.getById(appId);
      setSelectedApp(res.data?.data || null);
    } catch (err) {
      console.error('Failed to get application detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusModalApp) return;
    setUpdating(true);
    setUpdateError('');

    try {
      await applicationsAPI.setStatus(statusModalApp.application_id, newStatus, officerRemarks);
      setStatusModalApp(null);
      setOfficerRemarks('');
      await loadApplications();
      if (selectedApp?.application_id === statusModalApp.application_id) {
        await viewDetails(statusModalApp.application_id);
      }
    } catch (err) {
      setUpdateError(err.response?.data?.error || 'Failed to update application status.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <span className="badge badge-info">Submitted</span>;
      case 'under_review':
        return <span className="badge badge-pending">Under Review</span>;
      case 'field_verification':
        return <span className="badge badge-medium">Field Verification</span>;
      case 'approved':
        return <span className="badge badge-success">Approved</span>;
      case 'rejected':
        return <span className="badge badge-critical">Rejected</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const filteredApps = applications.filter(app => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.application_no?.toLowerCase().includes(q) ||
      app.service_type?.toLowerCase().includes(q) ||
      app.ulpin?.toLowerCase().includes(q) ||
      app.applicant_name?.toLowerCase().includes(q)
    );
  });

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
              <FileText size={20} color="#059669" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                {isOfficer() ? 'Citizen Service Applications Workflow' : 'My Land Service Applications'}
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                {isOfficer()
                  ? 'Review, field inspect, and process citizen mutations, conversions, and demarcation requests.'
                  : 'Track the status and statutory progress of your filed land administration requests.'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {isCitizen() && (
            <button className="btn btn-primary" onClick={() => navigate('/services')}>
              <Plus size={16} /> New Service Request
            </button>
          )}
          <button className="btn btn-ghost" onClick={loadApplications} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Control Bar: Search + Filter */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 16, marginBottom: 20, flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', width: 340 }}>
          <Search size={16} color="#059669" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            className="input"
            placeholder="Search by Application No, ULPIN, or Service..."
            style={{ paddingLeft: 36 }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {isOfficer() && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} color="#64748b" />
            <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Status:</span>
            {['all', 'submitted', 'under_review', 'field_verification', 'approved', 'rejected'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '4px 12px', fontSize: 12, textTransform: 'capitalize' }}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-brand)', fontWeight: 600 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
          <div>Loading applications…</div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>No applications found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            {isCitizen()
              ? 'You have not submitted any service applications yet. Apply for a mutation or survey to begin.'
              : 'There are no service applications matching your current filter.'}
          </div>
          {isCitizen() && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/services')}>
              <Plus size={14} /> Submit Your First Request
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Application No</th>
                <th>Service Type</th>
                <th>Target Parcel (ULPIN)</th>
                {isOfficer() && <th>Citizen / Applicant</th>}
                <th>Submission Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => (
                <tr key={app.application_id}>
                  <td>
                    <div
                      style={{ fontWeight: 700, color: 'var(--color-brand-500)', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
                      onClick={() => viewDetails(app.application_id)}
                    >
                      {app.application_no}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {app.service_type?.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.description}
                    </div>
                  </td>
                  <td>
                    {app.ulpin ? (
                      <div
                        style={{ color: 'var(--color-brand-500)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
                        onClick={() => navigate(`/parcels/${app.ulpin}`)}
                      >
                        {app.ulpin}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>N/A (General Service)</span>
                    )}
                  </td>
                  {isOfficer() && (
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 13 }}>
                        {app.applicant_name || 'Citizen'}
                      </div>
                      {app.applicant_phone && (
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{app.applicant_phone}</div>
                      )}
                    </td>
                  )}
                  <td>
                    <div style={{ fontSize: 13 }}>
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {new Date(app.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        className="btn btn-table-action"
                        onClick={() => viewDetails(app.application_id)}
                      >
                        <Eye size={14} /> Details
                      </button>

                      {isOfficer() && app.status !== 'approved' && app.status !== 'rejected' && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => {
                            setStatusModalApp(app);
                            setNewStatus(app.status === 'submitted' ? 'under_review' : 'field_verification');
                          }}
                        >
                          Process
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Application Detail View Modal */}
      {selectedApp && (
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
            maxWidth: 680,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'sticky', top: 0, background: 'var(--color-surface-800)', zIndex: 10
            }}>
              <div>
                <span className="section-label">Application Dossier</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {selectedApp.application_no}
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Status Header */}
              <div style={{
                background: 'var(--color-surface-700)',
                borderRadius: 12,
                padding: 18,
                marginBottom: 20,
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-brand)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Current Statutory Status
                    </div>
                    <div style={{ marginTop: 4 }}>{getStatusBadge(selectedApp.status)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Service Requested</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {selectedApp.service_type?.replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Status timeline progression */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                  {STATUS_STEPS.map((step, idx) => {
                    const isPassed =
                      selectedApp.status === 'approved' ||
                      (selectedApp.status === 'field_verification' && idx <= 2) ||
                      (selectedApp.status === 'under_review' && idx <= 1) ||
                      (selectedApp.status === 'submitted' && idx === 0);

                    const isCurrent = selectedApp.status === step;

                    return (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: isPassed ? '#059669' : isCurrent ? '#d97706' : 'var(--color-surface-800)',
                          color: isPassed || isCurrent ? '#fff' : 'var(--color-text-muted)', fontSize: 12, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: isCurrent ? '0 0 10px rgba(217, 119, 6, 0.4)' : 'none'
                        }}>
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <div style={{ fontSize: 10, color: isPassed ? 'var(--color-brand-500)' : isCurrent ? '#d97706' : 'var(--color-text-muted)', fontWeight: 600, marginTop: 6, textTransform: 'capitalize' }}>
                          {step.replace(/_/g, ' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
                <div style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-border)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Target Parcel (ULPIN)</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-brand-500)', marginTop: 2 }}>
                    {selectedApp.ulpin || 'N/A'}
                  </div>
                </div>
                <div style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-border)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Applicant Name</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>
                    {selectedApp.applicant_name}
                  </div>
                </div>
                <div style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-border)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Submission Timestamp</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    {new Date(selectedApp.submitted_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-border)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Village / Revenue Circle</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                    {selectedApp.village_name || 'Revenue Circle 04'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <div className="section-label">Applicant Statement & Requested Changes</div>
                <div style={{
                  background: 'var(--color-surface-700)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 13,
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6
                }}>
                  {selectedApp.description || 'No statement provided.'}
                </div>
              </div>

              {/* Status History / Audit Trail */}
              <div>
                <div className="section-label">Processing History & Officer Notes</div>
                {selectedApp.status_history && selectedApp.status_history.length > 0 ? (
                  <div style={{ borderLeft: '2px solid var(--color-border)', marginLeft: 8, paddingLeft: 16 }}>
                    {selectedApp.status_history.map(item => (
                      <div key={item.history_id} style={{ position: 'relative', marginBottom: 14 }}>
                        <div style={{
                          position: 'absolute', left: -22, top: 4, width: 10, height: 10,
                          borderRadius: '50%', background: '#059669'
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-brand-500)' }}>
                            {item.new_status?.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            by {item.changed_by_name || 'System'} • {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        {item.remarks && (
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                            "{item.remarks}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No status transitions recorded yet.</div>
                )}
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex', justifyContent: 'flex-end', gap: 10
            }}>
              {isOfficer() && selectedApp.status !== 'approved' && selectedApp.status !== 'rejected' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setStatusModalApp(selectedApp);
                    setNewStatus('field_verification');
                  }}
                >
                  Update Status / Take Action
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => setSelectedApp(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Officer Status Update Modal */}
      {statusModalApp && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: 20
        }}>
          <div className="glass-card" style={{
            background: 'var(--color-surface-800)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Advance Workflow: {statusModalApp.application_no}
              </div>
              <button
                onClick={() => setStatusModalApp(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} style={{ padding: 20 }}>
              {updateError && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#dc2626',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 14
                }}>
                  {updateError}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
                  Target Statutory Status:
                </label>
                <select
                  className="input"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                >
                  <option value="under_review">Under Review (Document Verification)</option>
                  <option value="field_verification">Field Verification (Survey Inspection)</option>
                  <option value="approved">Approved (Issue Mutation / Order)</option>
                  <option value="rejected">Rejected (Dismiss with Reasons)</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#065f46', marginBottom: 6 }}>
                  Officer Reason / Field Findings (Written to Immutable Audit Log):
                </label>
                <textarea
                  className="input"
                  rows={4}
                  required
                  placeholder="Enter details of field inspection, documentary cross-check, or approval order..."
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStatusModalApp(null)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${newStatus === 'rejected' ? 'btn-danger' : 'btn-primary'}`}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : `Advance to ${newStatus.replace(/_/g, ' ').toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
