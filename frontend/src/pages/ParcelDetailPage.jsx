import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { parcelsAPI } from '../services/api';
import {
  ArrowLeft, Map, AlertTriangle, Brain, User, FileText,
  Building2, Scale, CheckCircle, Clock, XCircle, Info
} from 'lucide-react';

const SECTION_ICONS = {
  revenue:        { icon:'💼', label:'Revenue Dept',    color:'#059669', dept:'Revenue Department' },
  registration:   { icon:'📋', label:'Registration',    color:'#0284c7', dept:'Registration Department' },
  tax:            { icon:'🏛️', label:'Property Tax',    color:'#7c3aed', dept:'Municipal Corporation' },
  permits:        { icon:'🏗️', label:'Building Permits', color:'#0284c7', dept:'Building Permit Authority' },
  planning:       { icon:'🗺️', label:'Town Planning',   color:'#d97706', dept:'Town Planning Dept' },
  legal:          { icon:'⚖️', label:'Legal/Disputes',  color:'#dc2626', dept:'District Court Records' },
  data_quality:   { icon:'📊', label:'Data Quality',    color:'#d97706', dept:'LANDSTACK Intelligence' },
  ai_intelligence:{ icon:'🤖', label:'AI Intelligence', color:'#059669', dept:'AI Change Detection' },
};

function SectionHeader({ sectionKey, data }) {
  const meta = SECTION_ICONS[sectionKey];
  if (!meta) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
      <div style={{
        width:32, height:32, background:`${meta.color}15`, borderRadius:8,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:16
      }}>{meta.icon}</div>
      <div>
        <div style={{ fontWeight:700, color:'#064e3b', fontSize:13 }}>{meta.label}</div>
        <div style={{ fontSize:11, color:'#64748b' }}>{data?.source || meta.dept}</div>
      </div>
    </div>
  );
}

function DataRow({ label, value, mono = false, highlight = false }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, gap:16 }}>
      <span style={{ fontSize:12, color:'#64748b', flexShrink:0, width:140 }}>{label}</span>
      <span style={{
        fontSize:12, color: highlight ? '#b45309' : '#0f172a',
        fontWeight: highlight ? 700 : 500,
        fontFamily: mono ? 'monospace' : 'inherit',
        textAlign:'right', wordBreak:'break-all'
      }}>{value}</span>
    </div>
  );
}

function AlertBadge({ severity, status }) {
  const map = { critical:'badge-critical', high:'badge-high', medium:'badge-medium', low:'badge-low', pending:'badge-pending', verified:'badge-success', dismissed:'badge-neutral' };
  return <span className={`badge ${map[severity] || map[status] || 'badge-neutral'}`}>{severity || status}</span>;
}

function ConfidenceBar({ value }) {
  const pct = Math.round(parseFloat(value) * 100);
  const color = pct >= 80 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div className="confidence-bar" style={{ flex:1 }}>
        <div className="confidence-fill" style={{ width:`${pct}%`, background:color }} />
      </div>
      <span style={{ fontSize:12, color, fontWeight:600 }}>{pct}%</span>
    </div>
  );
}

export default function ParcelDetailPage() {
  const { ulpin }   = useParams();
  const navigate    = useNavigate();
  const [data,  setData]    = useState(null);
  const [tab,   setTab]     = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    parcelsAPI.getUnified(ulpin).then(res => {
      setData(res.data.data);
      setLoading(false);
    }).catch(err => {
      setError(err.response?.data?.error || 'Failed to load parcel');
      setLoading(false);
    });
  }, [ulpin]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#64748b' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:8 }}>🗺️</div>
        <div>Building unified parcel view…</div>
        <div style={{ fontSize:12, marginTop:4 }}>Querying 5 departmental databases…</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:8 }}>⚠️</div>
        <div style={{ color:'#f87171' }}>{error}</div>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginTop:12 }}>← Go Back</button>
      </div>
    </div>
  );

  if (!data) return null;

  const { parcel, revenue, registration, tax, permits, planning, legal, data_quality, ai_intelligence } = data;

  const TABS = [
    { id:'overview',        label:'Overview',      badge: null },
    { id:'departments',     label:'Departments',   badge: null },
    { id:'quality',         label:'Data Quality',  badge: data_quality?.open_count || 0, color:'#f59e0b' },
    { id:'ai',              label:'AI Alerts',     badge: ai_intelligence?.pending_count || 0, color:'#0ea5e9' },
    { id:'legal',           label:'Legal',         badge: legal?.has_active_dispute ? 1 : 0, color:'#ef4444' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ padding:'6px 10px' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontFamily:'monospace', fontSize:18, fontWeight:800, color:'#059669' }}>
                {parcel.ulpin}
              </span>
              {data_quality?.has_critical && (
                <span className="badge badge-critical pulse-warning">CRITICAL ALERT</span>
              )}
              {ai_intelligence?.pending_count > 0 && (
                <span className="badge badge-pending">🤖 AI PENDING</span>
              )}
            </div>
            <div style={{ fontSize:12, color:'#475569', marginTop:2 }}>
              {parcel.village_name} · {parcel.block_name} · {parcel.district_name} · {parcel.state_name}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost" onClick={() => navigate(`/map?ulpin=${ulpin}`)}>
            <Map size={14} /> View on Map
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:'#ffffff', borderBottom:'1px solid rgba(5,150,105,0.15)', padding:'0 28px' }}>
        <div style={{ display:'flex', gap:0 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding:'12px 16px', background:'none', border:'none', cursor:'pointer',
                fontSize:13, fontWeight: tab === t.id ? 700 : 500, display:'flex', alignItems:'center', gap:6,
                color: tab === t.id ? '#064e3b' : '#64748b',
                borderBottom: tab === t.id ? '3px solid #059669' : '3px solid transparent',
                transition:'all 0.15s'
              }}
            >
              {t.label}
              {t.badge > 0 && (
                <span style={{
                  background: t.color || '#64748b',
                  color:'white', borderRadius:10, padding:'1px 6px', fontSize:10, fontWeight:700
                }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="page-body">
        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Map thumbnail */}
            <div className="glass-card" style={{ overflow:'hidden' }}>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid #f1f5f9' }}>
                <span style={{ fontSize:12, fontWeight:700, color:'#064e3b', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  Parcel Boundary
                </span>
              </div>
              <div style={{ height:250 }}>
                <MapContainer
                  bounds={
                    parcel.geometry
                      ? (() => {
                          const L = window.L;
                          try {
                            const bounds = require('leaflet').geoJSON({ type:'Feature', geometry:parcel.geometry }).getBounds();
                            return bounds;
                          } catch { return [[23.52, 87.31], [23.53, 87.32]]; }
                        })()
                      : [[23.52, 87.31], [23.53, 87.32]]
                  }
                  style={{ width:'100%', height:'100%' }}
                  zoomControl={false}
                  dragging={false}
                  scrollWheelZoom={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  {parcel.geometry && (
                    <GeoJSON
                      data={{ type:'Feature', geometry:parcel.geometry }}
                      style={{ color:'#059669', weight:2, fillColor:'#059669', fillOpacity:0.3 }}
                    />
                  )}
                </MapContainer>
              </div>
            </div>

            {/* Core info */}
            <div className="glass-card" style={{ padding:20 }}>
              <div className="section-label">Core Parcel Information</div>
              <DataRow label="ULPIN"          value={parcel.ulpin} mono />
              <DataRow label="Khasra / Dag"   value={parcel.khasra_no} />
              <DataRow label="Plot Number"    value={parcel.plot_no} />
              <DataRow label="Survey No"      value={parcel.survey_no} />
              <DataRow label="Land Use"       value={parcel.land_use} />
              <DataRow label="Land Type"      value={parcel.land_type} />
              <DataRow label="Village"        value={parcel.village_name} />
              <DataRow label="Block"          value={parcel.block_name} />
              <DataRow label="District"       value={parcel.district_name} />
              <DataRow label="State"          value={parcel.state_name} />
              <div style={{ height:1, background:'#f1f5f9', margin:'12px 0' }} />
              <DataRow
                label="Area (Revenue Records)"
                value={`${(parcel.area_recorded || 0).toLocaleString()} m²`}
              />
              <DataRow
                label="Area (GIS Computed)"
                value={`${(parcel.area_gis_computed || 0).toLocaleString()} m²`}
              />
              {parcel.area_mismatch_pct > 5 && (
                <DataRow
                  label="Area Mismatch"
                  value={`${parcel.area_mismatch_pct}% discrepancy ⚠️`}
                  highlight
                />
              )}
              <DataRow label="Has Overlap"    value={parcel.has_overlap ? 'YES — Boundary conflict detected ⚠️' : 'No'} highlight={parcel.has_overlap} />
            </div>

            {/* Owner summary */}
            {revenue?.owners?.length > 0 && (
              <div className="glass-card" style={{ padding:20 }}>
                <div className="section-label">Current Ownership (Revenue Records)</div>
                {revenue.owners.map((o, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, padding:'10px 12px', background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:8 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#064e3b' }}>{o.full_name}</div>
                      <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{o.ownership_type} · Since {o.effective_from?.slice(0,10)}</div>
                    </div>
                    <div style={{ fontWeight:800, color:'#059669', fontSize:14 }}>
                      {(o.ownership_share * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alert summary card */}
            <div className="glass-card" style={{ padding:20 }}>
              <div className="section-label">Intelligence Summary</div>
              <div style={{ display:'flex', gap:12 }}>
                {/* Data Quality */}
                <div style={{ flex:1, padding:'14px', background:data_quality.open_count > 0 ? '#fffbeb' : '#f0fdf4', borderRadius:8, border:`1px solid ${data_quality.open_count > 0 ? '#fde68a' : '#a7f3d0'}` }}>
                  <div style={{ fontSize:11, color:'#475569', fontWeight:600, marginBottom:4 }}>Data Quality</div>
                  <div style={{ fontSize:24, fontWeight:800, color:data_quality.open_count > 0 ? '#b45309' : '#059669' }}>
                    {data_quality.open_count}
                  </div>
                  <div style={{ fontSize:11, color:'#64748b' }}>Open Alerts</div>
                  {data_quality.has_critical && <div style={{ fontSize:11, color:'#dc2626', fontWeight:700, marginTop:4 }}>🔴 Critical Issue</div>}
                </div>
                {/* AI */}
                <div style={{ flex:1, padding:'14px', background:ai_intelligence.pending_count > 0 ? '#ecfdf5' : '#f8faf9', borderRadius:8, border:`1px solid ${ai_intelligence.pending_count > 0 ? '#a7f3d0' : '#e2e8f0'}` }}>
                  <div style={{ fontSize:11, color:'#475569', fontWeight:600, marginBottom:4 }}>AI Alerts</div>
                  <div style={{ fontSize:24, fontWeight:800, color:ai_intelligence.pending_count > 0 ? '#059669' : '#047857' }}>
                    {ai_intelligence.pending_count}
                  </div>
                  <div style={{ fontSize:11, color:'#64748b' }}>Pending Review</div>
                </div>
                {/* Legal */}
                <div style={{ flex:1, padding:'14px', background:legal.has_active_dispute ? '#fef2f2' : '#f8faf9', borderRadius:8, border:`1px solid ${legal.has_active_dispute ? '#fca5a5' : '#e2e8f0'}` }}>
                  <div style={{ fontSize:11, color:'#475569', fontWeight:600, marginBottom:4 }}>Disputes</div>
                  <div style={{ fontSize:24, fontWeight:800, color:legal.has_active_dispute ? '#dc2626' : '#059669' }}>
                    {legal.dispute_count}
                  </div>
                  <div style={{ fontSize:11, color:'#64748b' }}>Total Cases</div>
                  {legal.has_active_dispute && <div style={{ fontSize:11, color:'#dc2626', fontWeight:700, marginTop:4 }}>🔴 Active</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DEPARTMENTS TAB ── */}
        {tab === 'departments' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Registration */}
            <div className="glass-card" style={{ padding:20 }}>
              <SectionHeader sectionKey="registration" data={registration} />
              {registration?.records?.length === 0 ? (
                <p style={{ color:'#64748b', fontSize:12 }}>No registration records found</p>
              ) : registration?.records?.slice(0,3).map((r, i) => (
                <div key={i} style={{ padding:'10px 12px', background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:8, marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'#064e3b' }}>{r.deed_type || 'Sale Deed'}</span>
                    <span className="badge badge-success">{r.registration_date?.slice(0,10)}</span>
                  </div>
                  <div style={{ fontSize:11, color:'#475569' }}>
                    ₹{(r.consideration_amount || 0).toLocaleString()} · Doc #{r.doc_no || '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Property Tax */}
            <div className="glass-card" style={{ padding:20 }}>
              <SectionHeader sectionKey="tax" data={tax} />
              {tax?.current ? (
                <>
                  <DataRow label="Assessment Year"   value={tax.current.assessment_year} />
                  <DataRow label="Annual Tax"        value={`₹${(tax.current.annual_tax_amt || 0).toLocaleString()}`} />
                  <DataRow label="Payment Status"    value={tax.current.payment_status} />
                  {tax.total_arrears > 0 && (
                    <DataRow label="Total Arrears" value={`₹${tax.total_arrears.toLocaleString()}`} highlight />
                  )}
                </>
              ) : (
                <p style={{ color:'#64748b', fontSize:12 }}>No tax records found</p>
              )}
            </div>

            {/* Building Permits */}
            <div className="glass-card" style={{ padding:20 }}>
              <SectionHeader sectionKey="permits" data={permits} />
              {permits?.records?.length === 0 ? (
                <div style={{ padding:'12px', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, fontSize:12, color:'#92400e' }}>
                  ⚠️ No building permission on record
                </div>
              ) : permits?.records?.map((p, i) => (
                <div key={i} style={{ padding:'10px 12px', background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:8, marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#064e3b' }}>Permit #{p.permit_no}</span>
                    <span className={`badge badge-${p.status === 'approved' ? 'success' : 'warning'}`}>{p.status}</span>
                  </div>
                  <div style={{ fontSize:11, color:'#475569' }}>{p.approved_area_sqm} m² approved · {p.approval_date?.slice(0,10)}</div>
                </div>
              ))}
            </div>

            {/* Town Planning / Zoning */}
            <div className="glass-card" style={{ padding:20 }}>
              <SectionHeader sectionKey="planning" data={planning} />
              {planning?.zoning ? (
                <>
                  <DataRow label="Zone Type"         value={planning.zoning.zone_type} />
                  <DataRow label="Zone Code"         value={planning.zoning.zone_code} mono />
                  <DataRow label="Current Land Use"  value={parcel.land_use} />
                  {planning.zoning.zone_type !== parcel.land_use && (
                    <div style={{ padding:'10px 12px', background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, fontSize:12, color:'#b91c1c', marginTop:8 }}>
                      ⚠️ Land use may not match zoning designation
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color:'#64748b', fontSize:12 }}>No zoning records found</p>
              )}
            </div>
          </div>
        )}

        {/* ── DATA QUALITY TAB ── */}
        {tab === 'quality' && (
          <div>
            <div style={{ marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontSize:32, fontWeight:800, color: data_quality.open_count > 0 ? '#b45309' : '#059669' }}>
                {data_quality.open_count}
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:'#064e3b' }}>Open Data Quality Alerts</div>
                <div style={{ fontSize:12, color:'#64748b' }}>Automatically detected by LANDSTACK intelligence engine</div>
              </div>
            </div>

            {data_quality.alerts?.length === 0 && (
              <div style={{ textAlign:'center', padding:48, color:'#059669', fontWeight:600 }}>
                ✅ No data quality issues detected for this parcel
              </div>
            )}

            {data_quality.alerts?.map((alert, i) => (
              <div key={i} className={`alert-panel ${alert.severity}`} style={{ marginBottom:12, background:'#ffffff', border:'1px solid #e2e8f0', borderLeft:'4px solid ' + (alert.severity === 'critical' ? '#dc2626' : alert.severity === 'high' ? '#ef4444' : '#f59e0b'), boxShadow:'var(--shadow-card)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <AlertBadge severity={alert.severity} />
                    <span style={{ fontSize:13, fontWeight:700, color:'#064e3b' }}>
                      {alert.alert_type?.replace(/_/g,' ')}
                    </span>
                  </div>
                  <span style={{ fontSize:11, color:'#64748b' }}>{alert.detected_at?.slice(0,10)}</span>
                </div>
                <p style={{ margin:0, fontSize:13, color:'#334155', lineHeight:1.5 }}>{alert.description}</p>
                {alert.details && (
                  <div style={{ marginTop:8, padding:'8px 10px', background:'#f8faf9', border:'1px solid #e2e8f0', borderRadius:6, fontSize:11, color:'#475569', fontFamily:'monospace' }}>
                    {JSON.stringify(alert.details)}
                  </div>
                )}
              </div>
            ))}

            {/* Mismatch summary */}
            {parcel.area_mismatch_pct > 0 && (
              <div style={{ marginTop:20, padding:20, background:'#ffffff', border:'1px solid rgba(5,150,105,0.15)', borderRadius:12, boxShadow:'var(--shadow-card)' }}>
                <div className="section-label">Area Cross-Verification</div>
                <div style={{ display:'flex', gap:20 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:'#64748b', marginBottom:4 }}>Revenue Records</div>
                    <div style={{ fontSize:20, fontWeight:800, color:'#0f172a' }}>{(parcel.area_recorded || 0).toLocaleString()} m²</div>
                  </div>
                  <div style={{ fontSize:24, color:'#94a3b8', display:'flex', alignItems:'center' }}>vs</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:'#64748b', marginBottom:4 }}>GIS Computed (PostGIS)</div>
                    <div style={{ fontSize:20, fontWeight:800, color:'#059669' }}>{(parcel.area_gis_computed || 0).toLocaleString()} m²</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:'#64748b', marginBottom:4 }}>Discrepancy</div>
                    <div style={{ fontSize:20, fontWeight:800, color: parseFloat(parcel.area_mismatch_pct) > 10 ? '#dc2626' : '#d97706' }}>
                      {parcel.area_mismatch_pct}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AI INTELLIGENCE TAB ── */}
        {tab === 'ai' && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, color:'#475569', marginBottom:16, lineHeight:1.7, background:'#ecfdf5', padding:'12px 16px', borderRadius:8, border:'1px solid #a7f3d0' }}>
                🤖 <strong style={{ color:'#064e3b' }}>AI Change Detection</strong> analyzes satellite imagery and cross-departmental data to detect unauthorized construction, land use changes, and encroachments. All detections require <strong style={{ color:'#b45309' }}>officer verification</strong> before any action is taken.
              </div>
            </div>

            {ai_intelligence.alerts?.length === 0 && (
              <div style={{ textAlign:'center', padding:48, color:'#059669', fontWeight:600 }}>
                ✅ No AI-detected changes for this parcel
              </div>
            )}

            {ai_intelligence.alerts?.map((alert, i) => (
              <div key={i} className={`alert-panel ${alert.status}`} style={{ marginBottom:16, background:'#ffffff', border:'1px solid #e2e8f0', borderLeft:'4px solid ' + (alert.status === 'verified' ? '#059669' : '#f59e0b'), boxShadow:'var(--shadow-card)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:'#064e3b' }}>
                        🤖 {alert.alert_type?.replace(/_/g,' ')}
                      </span>
                      <AlertBadge status={alert.status} />
                    </div>
                    <p style={{ margin:0, fontSize:13, color:'#334155', lineHeight:1.5 }}>{alert.description}</p>
                  </div>
                  <span style={{ fontSize:11, color:'#64748b', flexShrink:0, marginLeft:12 }}>{alert.detected_at?.slice(0,10)}</span>
                </div>

                {/* Confidence */}
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11, color:'#475569', fontWeight:600, marginBottom:4 }}>Detection Confidence</div>
                  <ConfidenceBar value={alert.confidence} />
                </div>

                {/* Evidence */}
                {alert.evidence_data && (
                  <div style={{ padding:'8px 10px', background:'#f8faf9', border:'1px solid #e2e8f0', borderRadius:6, fontSize:11, fontFamily:'monospace', color:'#334155', marginBottom:10 }}>
                    {Object.entries(alert.evidence_data).map(([k,v]) => (
                      <div key={k}><span style={{ color:'#047857', fontWeight:600 }}>{k}:</span> {String(v)}</div>
                    ))}
                  </div>
                )}

                {/* Affected area */}
                {alert.affected_area && (
                  <div style={{ fontSize:12, color:'#475569' }}>
                    Affected area: <strong style={{ color:'#0f172a' }}>{parseFloat(alert.affected_area).toLocaleString()} m²</strong>
                  </div>
                )}

                {/* Officer remarks if verified */}
                {alert.officer_remarks && (
                  <div style={{ marginTop:10, padding:'8px 12px', background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:6, fontSize:12, color:'#065f46', fontWeight:600 }}>
                    Officer: "{alert.officer_remarks}"
                  </div>
                )}

                {alert.status === 'pending' && (
                  <div style={{ marginTop:12, display:'flex', gap:8 }}>
                    <div style={{ fontSize:11, color:'#64748b', fontStyle:'italic' }}>
                      ℹ️ Review this alert in the <strong>Alerts</strong> section (requires officer role)
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── LEGAL TAB ── */}
        {tab === 'legal' && (
          <div>
            {legal.disputes?.length === 0 ? (
              <div style={{ textAlign:'center', padding:48, color:'#059669', fontWeight:600 }}>
                ✅ No legal disputes on record for this parcel
              </div>
            ) : legal.disputes?.map((d, i) => (
              <div key={i} className={`alert-panel ${d.status === 'active' ? 'high' : 'low'}`} style={{ marginBottom:12, background:'#ffffff', border:'1px solid #e2e8f0', borderLeft:'4px solid ' + (d.status === 'active' ? '#dc2626' : '#059669'), boxShadow:'var(--shadow-card)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#064e3b' }}>
                    {d.dispute_type?.replace(/_/g,' ')}
                  </span>
                  <span className={`badge badge-${d.status === 'active' ? 'high' : 'success'}`}>{d.status}</span>
                </div>
                <p style={{ margin:0, fontSize:13, color:'#334155' }}>{d.description}</p>
                <div style={{ fontSize:11, color:'#64748b', marginTop:8 }}>
                  Filed: {d.filed_date?.slice(0,10)} · Court: {d.court_name || 'District Court'} · Case: {d.case_no}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
