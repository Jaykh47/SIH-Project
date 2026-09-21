import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parcelsAPI } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import {
  ArrowLeft, Map, AlertTriangle, Brain, User, FileText,
  Building2, Scale, CheckCircle, Clock, XCircle, Info,
  Copy, Check, ExternalLink, Shield, Layers, Satellite,
  Compass, Eye, Download, Printer, RefreshCw, MapPin
} from 'lucide-react';

/* ── Leaflet Auto-Fit Bounds Helper ──────────────────────────── */
function MapFitBounds({ geometry }) {
  const map = useMap();
  useEffect(() => {
    if (!geometry) return;
    try {
      const layer = L.geoJSON({ type: 'Feature', geometry });
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 17 });
      }
    } catch (e) {
      console.warn('Could not compute parcel bounds:', e);
    }
  }, [geometry, map]);
  return null;
}

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
        width:34, height:34, background:`${meta.color}15`, borderRadius:8,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:17
      }}>{meta.icon}</div>
      <div>
        <div style={{ fontWeight:700, fontSize:13 }} className="parcel-card-title">{meta.label}</div>
        <div style={{ fontSize:11, color:'var(--color-text-muted, #64748b)' }}>{data?.source || meta.dept}</div>
      </div>
    </div>
  );
}

function DataRow({ label, value, mono = false, highlight = false, copyable = false }) {
  const [copied, setCopied] = useState(false);
  if (!value && value !== 0) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="parcel-data-row">
      <span className="parcel-data-label">{label}</span>
      <div className="parcel-data-value-wrap">
        <span className={`parcel-data-value ${mono ? 'mono' : ''} ${highlight ? 'highlight' : ''}`}>
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            title="Copy to clipboard"
            className="parcel-copy-btn"
          >
            {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
          </button>
        )}
      </div>
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
  const { ulpin }     = useParams();
  const navigate      = useNavigate();
  const { isDark }    = useTheme();
  const [data, setData]       = useState(null);
  const [tab, setTab]         = useState('overview');
  const [basemap, setBasemap] = useState('satellite'); // 'satellite' (Esri) or 'osm' (OpenStreetMap)
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [copiedUlpin, setCopiedUlpin] = useState(false);

  const fetchParcel = () => {
    setLoading(true);
    parcelsAPI.getUnified(ulpin).then(res => {
      setData(res.data.data);
      setLoading(false);
    }).catch(err => {
      setError(err.response?.data?.error || 'Failed to load parcel');
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchParcel();
  }, [ulpin]);

  const copyUlpinToClipboard = () => {
    if (!data?.parcel?.ulpin) return;
    navigator.clipboard.writeText(data.parcel.ulpin);
    setCopiedUlpin(true);
    setTimeout(() => setCopiedUlpin(false), 2000);
  };

  // Compute centroid coordinates
  const centroid = useMemo(() => {
    if (!data?.parcel?.geometry?.coordinates) return null;
    try {
      const geom = data.parcel.geometry;
      let coords = [];
      if (geom.type === 'MultiPolygon') {
        coords = geom.coordinates[0][0];
      } else if (geom.type === 'Polygon') {
        coords = geom.coordinates[0];
      }
      if (!coords || coords.length === 0) return null;
      let sumLng = 0, sumLat = 0;
      coords.forEach(([lng, lat]) => { sumLng += lng; sumLat += lat; });
      return {
        lat: (sumLat / coords.length).toFixed(5),
        lng: (sumLng / coords.length).toFixed(5)
      };
    } catch {
      return null;
    }
  }, [data?.parcel?.geometry]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', minHeight: 400, color:'var(--color-text-muted, #64748b)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:36, marginBottom:12 }} className="animate-bounce">🗺️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>Building Unified Cadastral Dossier…</div>
        <div style={{ fontSize:12, marginTop:6 }}>Cross-querying Revenue, Registration, Municipal &amp; AI Intelligence nodes…</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', minHeight: 400 }}>
      <div style={{ textAlign:'center', maxWidth: 420 }}>
        <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
        <div style={{ color:'#f87171', fontWeight: 600, fontSize: 15 }}>{error}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Go Back</button>
          <button className="btn btn-primary" onClick={fetchParcel}>Retry Query</button>
        </div>
      </div>
    </div>
  );

  if (!data) return null;

  const { parcel, revenue, registration, tax, permits, planning, legal, data_quality, ai_intelligence } = data;

  const recordedArea = parseFloat(parcel.area_recorded) || 0;
  const gisArea = parseFloat(parcel.area_gis_computed) || 0;
  const computedMismatchPct = recordedArea > 0
    ? ((Math.abs(gisArea - recordedArea) / recordedArea) * 100).toFixed(1)
    : 0;
  const displayMismatchPct = parseFloat(computedMismatchPct) > 0 ? computedMismatchPct : (parcel.area_mismatch_pct || 0);
  const hasAreaMismatch = parseFloat(displayMismatchPct) > 5 || parseFloat(parcel.area_mismatch_pct) > 5;
  const hasCriticalAlert = data_quality?.has_critical;
  const hasDispute = legal?.has_active_dispute;

  // Integrated depts count
  const activeDepts = [
    revenue?.has_owners,
    registration?.records?.length > 0,
    tax?.current !== null,
    permits?.records?.length > 0,
    planning?.zoning !== null,
    true // PostGIS
  ].filter(Boolean).length;
  const syncScore = Math.round((activeDepts / 6) * 100);

  const TABS = [
    { id:'overview',        label:'Overview',      badge: null },
    { id:'departments',     label:'Departments',   badge: null },
    { id:'quality',         label:'Data Quality',  badge: data_quality?.open_count || 0, color:'#f59e0b' },
    { id:'ai',              label:'AI Alerts',     badge: ai_intelligence?.pending_count || 0, color:'#0ea5e9' },
    { id:'legal',           label:'Legal',         badge: legal?.has_active_dispute ? 1 : 0, color:'#ef4444' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100%' }}>
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="page-header" style={{ padding: '16px 28px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
            style={{ padding:'7px 10px', borderRadius: 8 }}
            title="Go back to previous page"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily:'monospace',
                  fontSize: 18,
                  fontWeight: 800,
                  color: 'var(--color-text-brand, #52b788)',
                  background: isDark ? 'rgba(82, 183, 136, 0.12)' : 'var(--sb-50)',
                  border: isDark ? '1px solid rgba(82, 183, 136, 0.25)' : '1px solid rgba(45, 106, 79, 0.2)',
                  padding: '2px 8px',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {parcel.ulpin}
                <button
                  onClick={copyUlpinToClipboard}
                  title="Copy ULPIN"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', color: 'inherit' }}
                >
                  {copiedUlpin ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </span>

              {hasCriticalAlert && (
                <span className="badge badge-critical pulse-warning">CRITICAL ANOMALY</span>
              )}
              {ai_intelligence?.pending_count > 0 && (
                <span className="badge badge-pending">🤖 AI PENDING ({ai_intelligence.pending_count})</span>
              )}
              {hasDispute && (
                <span className="badge badge-danger">⚖️ LEGAL DISPUTE</span>
              )}
              <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                {parcel.land_use || 'Land Parcel'}
              </span>
            </div>

            <div style={{ fontSize:12, color:'var(--color-text-muted, #64748b)', marginTop:4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={12} color="var(--sb-600)" />
              <span>{parcel.village_name || parcel.mouza_name} · {parcel.block_name} · {parcel.district_name} · {parcel.state_name}</span>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => window.print()}
            title="Print dossier summary"
            style={{ gap: 6 }}
          >
            <Printer size={14} /> Print Dossier
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/map?ulpin=${ulpin}`)}
            style={{ gap: 6 }}
          >
            <Map size={14} /> View on GIS Map
          </button>
        </div>
      </div>

      {/* ── Tab Navigation Bar ─────────────────────────────────── */}
      <div className="parcel-tabs-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`parcel-tab-btn ${tab === t.id ? 'active' : ''}`}
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

      {/* ── Main Tab Body ──────────────────────────────────────── */}
      <div className="page-body" style={{ padding: '24px 28px', flexGrow: 1 }}>

        {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
        {tab === 'overview' && (
          <div>
            {/* Top 4 KPI Metric Cards */}
            <div className="parcel-hero-stats">
              <div className="parcel-stat-card">
                <div className="parcel-stat-label">Recorded Area (RoR)</div>
                <div className="parcel-stat-value">
                  {(parcel.area_recorded || 0).toLocaleString()} <span className="parcel-stat-unit">m²</span>
                </div>
                <div className="parcel-stat-sub">Revenue Registry Record</div>
              </div>

              <div className={`parcel-stat-card ${hasAreaMismatch ? 'anomaly' : ''}`}>
                <div className="parcel-stat-label">GIS Digitized Area</div>
                <div className={`parcel-stat-value ${hasAreaMismatch ? 'anomaly' : ''}`}>
                  {(parcel.area_gis_computed || 0).toLocaleString()} <span className="parcel-stat-unit">m²</span>
                </div>
                <div className="parcel-stat-sub">
                  {hasAreaMismatch ? `⚠️ Discrepancy: ${displayMismatchPct}%` : 'PostGIS Digitized Polygon ✓'}
                </div>
              </div>

              <div className="parcel-stat-card">
                <div className="parcel-stat-label">Classification &amp; Zone</div>
                <div className="parcel-stat-value" style={{ textTransform: 'capitalize' }}>
                  {parcel.land_use || 'General'}
                </div>
                <div className="parcel-stat-sub">Type: {parcel.land_type || 'Unspecified'} · Survey: {parcel.survey_no || '—'}</div>
              </div>

              <div className="parcel-stat-card">
                <div className="parcel-stat-label">Cadastral Sync Health</div>
                <div className="parcel-stat-value" style={{ color: syncScore >= 80 ? '#10b981' : '#f59e0b' }}>
                  {syncScore}%
                </div>
                <div className="parcel-stat-sub">{activeDepts} of 6 Departments Linked</div>
              </div>
            </div>

            {/* Critical Anomaly Banner if Mismatch exists */}
            {hasAreaMismatch && (
              <div className="parcel-anomaly-banner">
                <div style={{ fontSize: 24, flexShrink: 0 }}>⚠️</div>
                <div style={{ flex: 1 }}>
                  <div className="parcel-anomaly-title">Spatial Cadastral Discrepancy Detected</div>
                  <p className="parcel-anomaly-desc">
                    GIS digitized polygon boundary (<strong>{(parcel.area_gis_computed || 0).toLocaleString()} m²</strong>) deviates significantly from the recorded deed area (<strong>{(parcel.area_recorded || 0).toLocaleString()} m²</strong>). Area mismatch discrepancy is <strong>{displayMismatchPct}%</strong>. Cadastral resurvey recommended.
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setTab('quality')}
                  style={{ flexShrink: 0, fontSize: 11 }}
                >
                  View Quality Audit
                </button>
              </div>
            )}

            {/* Core 2-Column Grid: Map on Left, Attributes on Right */}
            <div className="parcel-overview-grid">
              {/* Map Column */}
              <div className="parcel-card parcel-map-card">
                <div className="parcel-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Compass size={16} color="#10b981" />
                    <span className="parcel-card-title">Cadastral Boundary Map</span>
                  </div>

                  {/* Clean Basemap Switcher (Esri Satellite & OSM Streets - ZERO WATERMARK) */}
                  <div className="parcel-basemap-toggle">
                    <button
                      type="button"
                      className={`parcel-basemap-btn ${basemap === 'satellite' ? 'active' : ''}`}
                      onClick={() => setBasemap('satellite')}
                    >
                      🛰️ Satellite
                    </button>
                    <button
                      type="button"
                      className={`parcel-basemap-btn ${basemap === 'osm' ? 'active' : ''}`}
                      onClick={() => setBasemap('osm')}
                    >
                      🗺️ Streets
                    </button>
                  </div>
                </div>

                <div className="parcel-map-wrapper">
                  <MapContainer
                    center={centroid ? [parseFloat(centroid.lat), parseFloat(centroid.lng)] : [23.525, 87.315]}
                    zoom={15}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={true}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      key={basemap}
                      url={
                        basemap === 'satellite'
                          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                      }
                      attribution={
                        basemap === 'satellite'
                          ? '&copy; Esri &copy; Maxar'
                          : '&copy; OpenStreetMap contributors'
                      }
                      maxZoom={19}
                    />
                    <MapFitBounds geometry={parcel.geometry} />
                    {parcel.geometry && (
                      <GeoJSON
                        key={`${ulpin}-${basemap}`}
                        data={{ type: 'Feature', geometry: parcel.geometry }}
                        style={{
                          color: '#10b981',
                          weight: 3,
                          fillColor: '#10b981',
                          fillOpacity: basemap === 'satellite' ? 0.35 : 0.25,
                          dashArray: '4, 2'
                        }}
                      />
                    )}
                  </MapContainer>
                </div>

                <div className="parcel-map-footer">
                  {centroid && (
                    <div className="parcel-centroid-badge">
                      <MapPin size={12} color="#10b981" />
                      <span>{centroid.lat}° N, {centroid.lng}° E</span>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted, #64748b)' }}>
                    EPSG:32644 (UTM 44N)
                  </div>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => navigate(`/map?ulpin=${ulpin}`)}
                    style={{ marginLeft: 'auto', gap: 6, fontSize: 11 }}
                  >
                    Full GIS Studio <ExternalLink size={12} />
                  </button>
                </div>
              </div>

              {/* Core Attributes Column */}
              <div className="parcel-card">
                <div className="parcel-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} color="#10b981" />
                    <span className="parcel-card-title">Core Cadastral Information</span>
                  </div>
                  <span className="badge badge-success">✓ PostGIS Verified</span>
                </div>

                <div className="parcel-data-grid">
                  <DataRow label="ULPIN" value={parcel.ulpin} mono copyable />
                  <DataRow label="Khasra / Dag" value={parcel.khasra_no} copyable />
                  <DataRow label="Plot Number" value={parcel.plot_no} />
                  <DataRow label="Survey No" value={parcel.survey_no} />
                  <DataRow label="Land Use" value={parcel.land_use} highlight />
                  <DataRow label="Land Type" value={parcel.land_type} />
                  <DataRow label="Village / Mouza" value={parcel.village_name || parcel.mouza_name} />
                  <DataRow label="Block / Tehsil" value={parcel.block_name} />
                  <DataRow label="District" value={parcel.district_name} />
                  <DataRow label="State" value={parcel.state_name} />
                  <div className="parcel-data-divider" />
                  <DataRow
                    label="Area (Revenue Records)"
                    value={`${(parcel.area_recorded || 0).toLocaleString()} m²`}
                  />
                  <DataRow
                    label="Area (GIS Computed)"
                    value={`${(parcel.area_gis_computed || 0).toLocaleString()} m²`}
                  />
                  {hasAreaMismatch && (
                    <DataRow
                      label="Area Discrepancy"
                      value={`${displayMismatchPct}% mismatch ⚠️`}
                      highlight
                    />
                  )}
                  <DataRow
                    label="Boundary Conflict"
                    value={parcel.has_overlap ? '⚠️ Boundary Overlap Detected' : 'No Overlap Detected ✓'}
                    highlight={parcel.has_overlap}
                  />
                </div>
              </div>
            </div>

            {/* Current Ownership (RoR Revenue Records) */}
            {revenue?.owners?.length > 0 && (
              <div className="parcel-card" style={{ marginBottom: 20 }}>
                <div className="parcel-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={16} color="#10b981" />
                    <span className="parcel-card-title">Current Titleholders (RoR Revenue Records)</span>
                  </div>
                  <span className="badge badge-neutral">
                    {revenue.owners.length} Registered Owner{revenue.owners.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  {revenue.owners.map((o, i) => (
                    <div key={i} className="parcel-owner-item">
                      <div className="parcel-owner-avatar">
                        <User size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="parcel-owner-name">{o.full_name}</div>
                        <div className="parcel-owner-meta">
                          {o.father_name && <span>S/O {o.father_name} · </span>}
                          <span>{o.ownership_type || 'Titleholder'}</span>
                          {o.effective_from && <span> · Effective from {o.effective_from.slice(0, 10)}</span>}
                          {o.source_record_id && <span> · Record #{o.source_record_id}</span>}
                        </div>
                      </div>
                      <div className="parcel-owner-share">
                        {(o.ownership_share * 100).toFixed(0)}%
                        <span className="parcel-owner-share-sub">Ownership Share</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4 Department Snapshot Cards */}
            <div className="parcel-dept-grid">
              {/* Registration */}
              <div className="parcel-dept-card">
                <div className="parcel-dept-header">
                  <div className="parcel-dept-icon blue">📋</div>
                  <div>
                    <div className="parcel-dept-title">Registration Dept</div>
                    <div className="parcel-dept-sub">Sub-Registrar Deeds</div>
                  </div>
                </div>
                {registration?.records?.length > 0 ? (
                  <div>
                    <div className="parcel-dept-keyval">
                      <span>Latest Deed</span>
                      <strong>{registration.records[0].deed_type || 'Sale Deed'}</strong>
                    </div>
                    <div className="parcel-dept-keyval">
                      <span>Date</span>
                      <strong>{registration.records[0].registration_date?.slice(0, 10)}</strong>
                    </div>
                    <div className="parcel-dept-keyval">
                      <span>Consideration</span>
                      <strong style={{ color: '#10b981' }}>₹{(registration.records[0].consideration_amount || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="parcel-empty-note">No deed indexed</div>
                )}
              </div>

              {/* Municipal Tax */}
              <div className="parcel-dept-card">
                <div className="parcel-dept-header">
                  <div className="parcel-dept-icon purple">🏛️</div>
                  <div>
                    <div className="parcel-dept-title">Property Tax</div>
                    <div className="parcel-dept-sub">Municipal Assessment</div>
                  </div>
                </div>
                {tax?.current ? (
                  <div>
                    <div className="parcel-dept-keyval">
                      <span>Year</span>
                      <strong>{tax.current.assessment_year}</strong>
                    </div>
                    <div className="parcel-dept-keyval">
                      <span>Status</span>
                      <span className={`badge ${tax.current.payment_status?.toLowerCase() === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {tax.current.payment_status}
                      </span>
                    </div>
                    <div className="parcel-dept-keyval">
                      <span>Total Arrears</span>
                      <strong style={{ color: tax.total_arrears > 0 ? '#ef4444' : '#10b981' }}>
                        ₹{(tax.total_arrears || 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="parcel-empty-note">No municipal tax records</div>
                )}
              </div>

              {/* Town Planning */}
              <div className="parcel-dept-card">
                <div className="parcel-dept-header">
                  <div className="parcel-dept-icon amber">🗺️</div>
                  <div>
                    <div className="parcel-dept-title">Town Planning</div>
                    <div className="parcel-dept-sub">Master Plan Zoning</div>
                  </div>
                </div>
                {planning?.zoning ? (
                  <div>
                    <div className="parcel-dept-keyval">
                      <span>Zone</span>
                      <strong>{planning.zoning.zone_type}</strong>
                    </div>
                    <div className="parcel-dept-keyval">
                      <span>Code</span>
                      <strong style={{ fontFamily: 'monospace' }}>{planning.zoning.zone_code}</strong>
                    </div>
                    <div className="parcel-dept-keyval">
                      <span>Zoning Check</span>
                      <span className={`badge ${planning.zoning.zone_type === parcel.land_use ? 'badge-success' : 'badge-warning'}`}>
                        {planning.zoning.zone_type === parcel.land_use ? 'Matched' : 'Discrepancy'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="parcel-empty-note">Zoning record pending</div>
                )}
              </div>

              {/* Building Permits */}
              <div className="parcel-dept-card">
                <div className="parcel-dept-header">
                  <div className="parcel-dept-icon cyan">🏗️</div>
                  <div>
                    <div className="parcel-dept-title">Building Permits</div>
                    <div className="parcel-dept-sub">Urban Local Body</div>
                  </div>
                </div>
                {permits?.records?.length > 0 ? (
                  <div>
                    <div className="parcel-dept-keyval">
                      <span>Permit</span>
                      <strong>#{permits.records[0].permit_no}</strong>
                    </div>
                    <div className="parcel-dept-keyval">
                      <span>Status</span>
                      <span className="badge badge-success">{permits.records[0].status}</span>
                    </div>
                    <div className="parcel-dept-keyval">
                      <span>Sanctioned</span>
                      <strong>{permits.records[0].approved_area_sqm} m²</strong>
                    </div>
                  </div>
                ) : (
                  <div className="parcel-empty-note">No building permission</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── DEPARTMENTS TAB ──────────────────────────────────── */}
        {tab === 'departments' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Registration */}
            <div className="parcel-card">
              <SectionHeader sectionKey="registration" data={registration} />
              {registration?.records?.length === 0 ? (
                <p style={{ color:'var(--color-text-muted, #64748b)', fontSize:12 }}>No registration records found</p>
              ) : registration?.records?.map((r, i) => (
                <div key={i} className="parcel-owner-item" style={{ marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--color-text-primary, #0f172a)' }}>
                        {r.deed_type || 'Sale Deed'}
                      </span>
                      <span className="badge badge-success">{r.registration_date?.slice(0,10)}</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--color-text-muted, #475569)' }}>
                      Consideration: <strong style={{ color: '#10b981' }}>₹{(r.consideration_amount || 0).toLocaleString()}</strong> · Doc #{r.doc_no || '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Property Tax */}
            <div className="parcel-card">
              <SectionHeader sectionKey="tax" data={tax} />
              {tax?.current ? (
                <div className="parcel-data-grid">
                  <DataRow label="Assessment Year" value={tax.current.assessment_year} />
                  <DataRow label="Annual Tax" value={`₹${(tax.current.annual_tax_amt || 0).toLocaleString()}`} />
                  <DataRow label="Payment Status" value={tax.current.payment_status} highlight={tax.current.payment_status !== 'Paid'} />
                  {tax.total_arrears > 0 && (
                    <DataRow label="Total Arrears" value={`₹${tax.total_arrears.toLocaleString()}`} highlight />
                  )}
                  <DataRow label="Receipt Number" value={tax.current.receipt_no || 'Pending'} mono />
                </div>
              ) : (
                <p style={{ color:'var(--color-text-muted, #64748b)', fontSize:12 }}>No tax records found</p>
              )}
            </div>

            {/* Building Permits */}
            <div className="parcel-card">
              <SectionHeader sectionKey="permits" data={permits} />
              {permits?.records?.length === 0 ? (
                <div className="parcel-anomaly-banner" style={{ margin: 0 }}>
                  <span style={{ fontSize: 18 }}>⚠️</span>
                  <div className="parcel-anomaly-desc">No building permission sanctioned on record. Any structural construction may require regularisation.</div>
                </div>
              ) : permits?.records?.map((p, i) => (
                <div key={i} className="parcel-owner-item" style={{ marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--color-text-primary, #0f172a)' }}>
                        Permit #{p.permit_no}
                      </span>
                      <span className={`badge badge-${p.status === 'approved' ? 'success' : 'warning'}`}>{p.status}</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--color-text-muted, #475569)' }}>
                      Approved Area: <strong>{p.approved_area_sqm} m²</strong> · Sanctioned on {p.approval_date?.slice(0,10)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Town Planning / Zoning */}
            <div className="parcel-card">
              <SectionHeader sectionKey="planning" data={planning} />
              {planning?.zoning ? (
                <div className="parcel-data-grid">
                  <DataRow label="Zone Type" value={planning.zoning.zone_type} />
                  <DataRow label="Zone Code" value={planning.zoning.zone_code} mono />
                  <DataRow label="Current Land Use" value={parcel.land_use} />
                  {planning.zoning.zone_type !== parcel.land_use && (
                    <div className="parcel-anomaly-banner" style={{ margin: '12px 0 0' }}>
                      <span style={{ fontSize: 18 }}>⚠️</span>
                      <div className="parcel-anomaly-desc">Land use ({parcel.land_use}) does not conform with master plan zoning ({planning.zoning.zone_type}).</div>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color:'var(--color-text-muted, #64748b)', fontSize:12 }}>No zoning records found</p>
              )}
            </div>
          </div>
        )}

        {/* ── DATA QUALITY TAB ─────────────────────────────────── */}
        {tab === 'quality' && (
          <div>
            <div style={{ marginBottom:20, display:'flex', alignItems:'center', gap:14 }}>
              <div style={{
                fontSize:34, fontWeight:800,
                color: data_quality.open_count > 0 ? '#f59e0b' : '#10b981',
                fontFamily: 'Outfit, sans-serif'
              }}>
                {data_quality.open_count}
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:'var(--color-text-primary, #0f172a)' }}>
                  Open Data Quality Audit Alerts
                </div>
                <div style={{ fontSize:12, color:'var(--color-text-muted, #64748b)' }}>
                  Continuously synthesized by LANDSTACK inter-departmental conflict reconciliation engine
                </div>
              </div>
            </div>

            {data_quality.alerts?.length === 0 && (
              <div className="parcel-card" style={{ textAlign:'center', padding:48 }}>
                <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <div style={{ color:'#10b981', fontWeight:700, fontSize: 16 }}>No Data Quality Issues Detected</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted, #64748b)', marginTop: 4 }}>
                  All revenue, registration, spatial, and municipal attributes are 100% harmonized.
                </div>
              </div>
            )}

            {data_quality.alerts?.map((alert, i) => (
              <div
                key={i}
                className="parcel-card"
                style={{
                  marginBottom:14,
                  borderLeft: `4px solid ${alert.severity === 'critical' ? '#dc2626' : alert.severity === 'high' ? '#ef4444' : '#f59e0b'}`
                }}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <AlertBadge severity={alert.severity} />
                    <span style={{ fontSize:14, fontWeight:700, color:'var(--color-text-primary, #0f172a)' }}>
                      {alert.alert_type?.replace(/_/g,' ')}
                    </span>
                  </div>
                  <span style={{ fontSize:11, color:'var(--color-text-muted, #64748b)' }}>{alert.detected_at?.slice(0,10)}</span>
                </div>
                <p style={{ margin:0, fontSize:13, color:'var(--color-text-secondary, #334155)', lineHeight:1.5 }}>
                  {alert.description}
                </p>
                {alert.details && (
                  <div style={{
                    marginTop:10, padding:'10px 12px',
                    background: isDark ? '#09120c' : '#f8faf9',
                    border: isDark ? '1px solid rgba(82, 183, 136, 0.2)' : '1px solid #e2e8f0',
                    borderRadius:8, fontSize:12,
                    color:'var(--color-text-primary, #475569)',
                    fontFamily:'monospace'
                  }}>
                    {Object.entries(alert.details).map(([k, v]) => (
                      <div key={k} style={{ padding: '2px 0' }}>
                        <span style={{ color: 'var(--color-text-brand, #059669)', fontWeight: 600 }}>{k}:</span> {String(v)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Area Cross-Verification Breakdown Card */}
            {parcel.area_mismatch_pct > 0 && (
              <div className="parcel-card" style={{ marginTop:20 }}>
                <div className="parcel-card-header" style={{ padding: 0, paddingBottom: 14, marginBottom: 14 }}>
                  <span className="parcel-card-title">Detailed Spatial Area Cross-Verification</span>
                </div>
                <div style={{ display:'flex', gap:20, flexWrap: 'wrap' }}>
                  <div style={{ flex:1, minWidth: 160 }}>
                    <div style={{ fontSize:11, color:'var(--color-text-muted, #64748b)', marginBottom:4, textTransform: 'uppercase', fontWeight: 600 }}>Revenue Records (RoR)</div>
                    <div style={{ fontSize:22, fontWeight:800, color:'var(--color-text-primary, #0f172a)' }}>
                      {(parcel.area_recorded || 0).toLocaleString()} m²
                    </div>
                  </div>
                  <div style={{ fontSize:24, color:'var(--color-text-muted, #94a3b8)', display:'flex', alignItems:'center' }}>vs</div>
                  <div style={{ flex:1, minWidth: 160 }}>
                    <div style={{ fontSize:11, color:'var(--color-text-muted, #64748b)', marginBottom:4, textTransform: 'uppercase', fontWeight: 600 }}>GIS Computed (PostGIS)</div>
                    <div style={{ fontSize:22, fontWeight:800, color:'#10b981' }}>
                      {(parcel.area_gis_computed || 0).toLocaleString()} m²
                    </div>
                  </div>
                  <div style={{ flex:1, minWidth: 160 }}>
                    <div style={{ fontSize:11, color:'var(--color-text-muted, #64748b)', marginBottom:4, textTransform: 'uppercase', fontWeight: 600 }}>Area Discrepancy</div>
                    <div style={{ fontSize:22, fontWeight:800, color: parseFloat(parcel.area_mismatch_pct) > 10 ? '#ef4444' : '#f59e0b' }}>
                      {parcel.area_mismatch_pct}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AI INTELLIGENCE TAB ──────────────────────────────── */}
        {tab === 'ai' && (
          <div>
            <div className="parcel-card" style={{ marginBottom: 20, background: isDark ? 'rgba(16, 28, 22, 0.9)' : '#ecfdf5', borderColor: isDark ? 'rgba(82, 183, 136, 0.3)' : '#a7f3d0' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24 }}>🤖</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary, #064e3b)' }}>
                    AI Satellite Change Detection &amp; Encroachment Monitoring
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted, #475569)', lineHeight: 1.6 }}>
                    LANDSTACK analyzes periodic Sentinel-2, Landsat, and state aerial imagery to identify unpermitted ground disturbances, tree clearance, and new structures. Detections require physical ground-truthing by revenue inspection officers.
                  </p>
                </div>
              </div>
            </div>

            {ai_intelligence.alerts?.length === 0 && (
              <div className="parcel-card" style={{ textAlign:'center', padding:48 }}>
                <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <div style={{ color:'#10b981', fontWeight:700, fontSize: 16 }}>No AI-Detected Anomalies</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted, #64748b)', marginTop: 4 }}>
                  No structural change or vegetative alteration detected in recent satellite passes.
                </div>
              </div>
            )}

            {ai_intelligence.alerts?.map((alert, i) => (
              <div
                key={i}
                className="parcel-card"
                style={{
                  marginBottom:16,
                  borderLeft: `4px solid ${alert.status === 'verified' ? '#10b981' : '#f59e0b'}`
                }}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:15, fontWeight:700, color:'var(--color-text-primary, #0f172a)' }}>
                        🤖 {alert.alert_type?.replace(/_/g,' ')}
                      </span>
                      <AlertBadge status={alert.status} />
                    </div>
                    <p style={{ margin:0, fontSize:13, color:'var(--color-text-secondary, #334155)', lineHeight:1.5 }}>
                      {alert.description}
                    </p>
                  </div>
                  <span style={{ fontSize:11, color:'var(--color-text-muted, #64748b)', flexShrink:0, marginLeft:12 }}>
                    {alert.detected_at?.slice(0,10)}
                  </span>
                </div>

                {/* Detection Confidence Bar */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, color:'var(--color-text-muted, #475569)', fontWeight:600, marginBottom:4 }}>
                    Model Confidence Score
                  </div>
                  <ConfidenceBar value={alert.confidence} />
                </div>

                {/* Evidence Data formatted */}
                {alert.evidence_data && (
                  <div style={{
                    padding:'10px 12px',
                    background: isDark ? '#09120c' : '#f8faf9',
                    border: isDark ? '1px solid rgba(82, 183, 136, 0.2)' : '1px solid #e2e8f0',
                    borderRadius:8, fontSize:11, fontFamily:'monospace',
                    color:'var(--color-text-primary, #334155)', marginBottom:10
                  }}>
                    {Object.entries(alert.evidence_data).map(([k,v]) => (
                      <div key={k} style={{ padding: '2px 0' }}>
                        <span style={{ color:'var(--color-text-brand, #047857)', fontWeight:600 }}>{k}:</span> {String(v)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Affected Area */}
                {alert.affected_area && (
                  <div style={{ fontSize:12, color:'var(--color-text-muted, #475569)' }}>
                    Estimated Ground Footprint: <strong style={{ color:'var(--color-text-primary, #0f172a)' }}>{parseFloat(alert.affected_area).toLocaleString()} m²</strong>
                  </div>
                )}

                {/* Officer Remarks */}
                {alert.officer_remarks && (
                  <div style={{
                    marginTop:10, padding:'8px 12px',
                    background: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5',
                    border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #a7f3d0',
                    borderRadius:6, fontSize:12, color: isDark ? '#86efac' : '#065f46', fontWeight:600
                  }}>
                    Officer Note: "{alert.officer_remarks}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── LEGAL TAB ────────────────────────────────────────── */}
        {tab === 'legal' && (
          <div>
            {legal.disputes?.length === 0 ? (
              <div className="parcel-card" style={{ textAlign:'center', padding:48 }}>
                <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <div style={{ color:'#10b981', fontWeight:700, fontSize: 16 }}>Clean Legal Title</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted, #64748b)', marginTop: 4 }}>
                  No civil, revenue court, or title disputes on record for this parcel.
                </div>
              </div>
            ) : legal.disputes?.map((d, i) => (
              <div
                key={i}
                className="parcel-card"
                style={{
                  marginBottom:14,
                  borderLeft: `4px solid ${d.status === 'active' ? '#dc2626' : '#10b981'}`
                }}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom:8 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'var(--color-text-primary, #0f172a)' }}>
                    ⚖️ {d.dispute_type?.replace(/_/g,' ')}
                  </span>
                  <span className={`badge badge-${d.status === 'active' ? 'danger' : 'success'}`}>{d.status}</span>
                </div>
                <p style={{ margin:0, fontSize:13, color:'var(--color-text-secondary, #334155)', lineHeight: 1.5 }}>
                  {d.description}
                </p>
                <div style={{ fontSize:11, color:'var(--color-text-muted, #64748b)', marginTop:10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>Filed: {d.filed_date?.slice(0,10)}</span>
                  <span>Court: {d.court_name || 'District Court'}</span>
                  <span>Case No: <strong style={{ fontFamily: 'monospace' }}>{d.case_no}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
