import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, alertsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuthContext';
import {
  LayoutDashboard, Map, AlertTriangle, FileText, 
  Brain, TrendingUp, CheckCircle, Clock, XCircle, AlertOctagon
} from 'lucide-react';

function StatCard({ label, value, sub, color='#059669', icon: Icon }) {
  return (
    <div className="stat-card" style={{ cursor:'default' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{
          width:36, height:36, borderRadius:8,
          background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ fontSize:28, fontWeight:800, color:'var(--color-text-primary)', fontFamily:'Space Grotesk', letterSpacing:'-0.02em' }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize:12, color:'var(--color-text-muted)', fontWeight:500, marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:color, fontWeight:600, marginTop:4 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats]       = useState(null);
  const [alertSum, setAlertSum] = useState(null);
  const [loading, setLoading]   = useState(true);
  const { user, isOfficer }     = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      dashboardAPI.stats(),
      alertsAPI.summary()
    ]).then(([s, a]) => {
      setStats(s.data.data);
      setAlertSum(a.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding:40, textAlign:'center', color:'var(--color-text-brand)', fontWeight:600 }}>Loading dashboard…</div>
  );

  const p = stats?.parcels || {};
  const ap = stats?.applications || {};

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:'var(--color-text-primary)', fontFamily:'Outfit, sans-serif' }}>
            Dashboard
          </h1>
          <p style={{ margin:0, fontSize:13, color:'var(--color-text-muted)', marginTop:2 }}>
            Welcome back, <strong style={{ color:'var(--color-text-primary)' }}>{user?.fullName}</strong> · {user?.roleName?.replace(/_/g,' ')}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/map')}>
          <Map size={14} /> Open GIS Map
        </button>
      </div>

      <div className="page-body">
        {/* Synthetic data notice */}
        <div className="disclaimer-banner" style={{ marginBottom:24 }}>
          ⚠️ SYNTHETIC PROTOTYPE — All parcel data, ownership records, and AI alerts shown here are artificially generated for demonstration purposes only
        </div>

        {/* Stat Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
          <StatCard label="Total Parcels"         value={p.total_parcels}         icon={Map}           color="#059669" />
          <StatCard label="Pending AI Alerts"     value={alertSum?.ai_alerts?.pending || 0}  icon={Brain}         color="#d97706" sub="Require officer review" />
          <StatCard label="Quality Alerts (Open)" value={alertSum?.quality_alerts ? Object.entries(alertSum.quality_alerts).filter(([k])=>k.includes('open')).reduce((s,[,v])=>s+v,0) : 0} icon={AlertTriangle} color="#dc2626" />
          <StatCard label="Applications"          value={ap.total}                icon={FileText}      color="#047857" sub={`${ap.submitted||0} pending`} />
          <StatCard label="Parcels w/ Overlap"    value={p.overlapping_parcels}   icon={AlertOctagon}  color="#d97706" sub="Boundary issues" />
          <StatCard label="Area Mismatches"       value={p.area_mismatch_parcels} icon={TrendingUp}    color="#0284c7" sub=">5% discrepancy" />
        </div>

        {/* Two columns */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
          {/* Land Use distribution */}
          <div style={{ background:'var(--color-surface-800)', border:'1px solid var(--color-border)', borderRadius:12, padding:24, boxShadow:'var(--shadow-card)' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:'var(--color-text-primary)', fontFamily:'Outfit, sans-serif' }}>
              Land Use Distribution (Prototype Area)
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {stats?.land_use_distribution?.map(item => {
                const total = parseInt(p.total_parcels || 1);
                const pct = Math.round(parseInt(item.count) / total * 100);
                const colors = { agricultural:'#059669', residential:'#0284c7', commercial:'#d97706', industrial:'#dc2626', forest:'#047857', govt:'#7c3aed' };
                const c = colors[item.land_use] || '#64748b';
                return (
                  <div key={item.land_use}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, color:'var(--color-text-primary)', fontWeight:500, textTransform:'capitalize' }}>{item.land_use}</span>
                      <span style={{ fontSize:12, color:'var(--color-text-muted)' }}>{item.count} parcels · {pct}%</span>
                    </div>
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{ width:`${pct}%`, background:c }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background:'var(--color-surface-800)', border:'1px solid var(--color-border)', borderRadius:12, padding:24, boxShadow:'var(--shadow-card)' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:'var(--color-text-primary)', fontFamily:'Outfit, sans-serif' }}>Quick Actions</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button className="btn btn-primary" style={{ justifyContent:'flex-start' }} onClick={() => navigate('/map')}>
                <Map size={14} /> Open GIS Map
              </button>
              <button className="btn btn-secondary" style={{ justifyContent:'flex-start' }} onClick={() => navigate('/search')}>
                🔍 Search Parcel
              </button>
              <button className="btn btn-secondary" style={{ justifyContent:'flex-start' }} onClick={() => navigate('/workflows')}>
                ⇄ Inter-Dept Workflows
              </button>
              {isOfficer() && (
                <button className="btn btn-ghost" style={{ justifyContent:'flex-start', color:'#d97706', borderColor:'rgba(217,119,6,0.3)', background:'rgba(217,119,6,0.1)' }} onClick={() => navigate('/alerts')}>
                  <AlertTriangle size={14} /> Review AI Alerts ({alertSum?.ai_alerts?.pending || 0})
                </button>
              )}
              <button className="btn btn-secondary" style={{ justifyContent:'flex-start' }} onClick={() => navigate('/applications')}>
                <FileText size={14} /> View Applications
              </button>
            </div>

            {/* SIH Demo paths */}
            <div style={{ marginTop:24, paddingTop:16, borderTop:'1px solid var(--color-border)' }}>
              <p style={{ fontSize:11, color:'var(--color-text-brand)', fontWeight:700, marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>SIH Demo Parcels</p>
              {['WB-DGP-00000013', 'WB-DGP-00000018', 'WB-DGP-00000002'].map(ulpin => (
                <button
                  key={ulpin}
                  onClick={() => navigate(`/parcels/${ulpin}`)}
                  style={{
                    display:'block', width:'100%', marginBottom:6, padding:'8px 10px',
                    background:'var(--color-surface-700)', border:'1px solid var(--color-border)',
                    borderRadius:6, color:'var(--color-text-brand)', fontSize:11, fontWeight:600, cursor:'pointer', textAlign:'left',
                    fontFamily:'monospace', transition:'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-brand-500)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                  {ulpin} →
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Department Integration & Governance Alerts ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:20 }}>
          {/* Department Sync Health */}
          <div style={{ background:'var(--color-surface-800)', border:'1px solid var(--color-border)', borderRadius:12, padding:22, boxShadow:'var(--shadow-card)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div>
                <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:'var(--color-text-primary)', fontFamily:'Outfit, sans-serif' }}>
                  Department Integration Status
                </h3>
                <p style={{ margin:'2px 0 0', fontSize:11, color:'var(--color-text-muted)' }}>Real-time API sync and data federation health</p>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:'var(--sb-400)', background:'rgba(82,183,136,0.12)', border:'1px solid rgba(82,183,136,0.25)', padding:'3px 8px', borderRadius:20 }}>
                98.4% Sync Health
              </span>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { name: 'Revenue / Bhu-Abhilekh (RoR)', status: 'Connected', time: '2 min ago' },
                { name: 'Registration Department (IGRS)', status: 'Connected', time: '4 min ago' },
                { name: 'Town Planning & Urban Zoning', status: 'Connected', time: '8 min ago' },
                { name: 'Property Tax & Local Body', status: 'Connected', time: '12 min ago' },
                { name: 'Infrastructure & Utilities', status: 'Connected', time: '15 min ago' },
                { name: 'Court & Boundary Dispute Ledger', status: 'Partial Sync', time: '1 hr ago' },
              ].map(dep => (
                <div key={dep.name} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'8px 10px', background:'var(--color-surface-700)', borderRadius:8, border:'1px solid var(--color-border)'
                }}>
                  <div>
                    <strong style={{ fontSize:12, color:'var(--color-text-primary)' }}>{dep.name}</strong>
                    <div style={{ fontSize:10, color:'var(--color-text-muted)' }}>Last sync: {dep.time}</div>
                  </div>
                  <span style={{
                    fontSize:11, fontWeight:700,
                    color: dep.status === 'Connected' ? 'var(--sb-400)' : '#d97706'
                  }}>
                    {dep.status === 'Connected' ? '✓ ' + dep.status : '⚡ ' + dep.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Governance Alerts */}
          <div style={{ background:'var(--color-surface-800)', border:'1px solid var(--color-border)', borderRadius:12, padding:22, boxShadow:'var(--shadow-card)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div>
                <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:'var(--color-text-primary)', fontFamily:'Outfit, sans-serif' }}>
                  Governance & Compliance Alerts
                </h3>
                <p style={{ margin:'2px 0 0', fontSize:11, color:'var(--color-text-muted)' }}>Automated anomaly detection across departments</p>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:'#ef4444', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', padding:'3px 8px', borderRadius:20 }}>
                Requires Review
              </span>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { title: 'Ownership Discrepancy', msg: '3 parcels differ between RoR record and recent sale deed.', color: '#ef4444', badge: 'High Severity' },
                { title: 'Building Footprint Change', msg: 'Satellite comparison detected unpermitted construction.', color: '#f59e0b', badge: 'Medium Severity' },
                { title: 'Property Tax Sync Pending', msg: 'Latest municipal property tax batch partially synchronized.', color: '#38bdf8', badge: 'Informational' },
              ].map(alert => (
                <div key={alert.title} style={{
                  padding:'10px 14px', background:'var(--color-surface-700)', borderRadius:8,
                  borderLeft:`4px solid ${alert.color}`, borderTop:'1px solid var(--color-border)',
                  borderRight:'1px solid var(--color-border)', borderBottom:'1px solid var(--color-border)'
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <strong style={{ fontSize:12, color:'var(--color-text-primary)' }}>{alert.title}</strong>
                    <span style={{ fontSize:10, color:alert.color, fontWeight:700 }}>{alert.badge}</span>
                  </div>
                  <div style={{ fontSize:11, color:'var(--color-text-muted)', marginTop:3 }}>{alert.msg}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIH Flow reminder */}
        <div style={{ marginTop:20, background:'var(--color-surface-800)', border:'1px solid var(--color-border)', borderRadius:12, padding:20, boxShadow:'var(--shadow-card)' }}>
          <h3 style={{ margin:'0 0 12px', fontSize:13, fontWeight:700, color:'var(--color-text-brand)' }}>SIH Demonstration Flow</h3>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            {[
              'Search ULPIN', 'GIS Map', 'Parcel Detail', 'Dept Data',
              'Quality Alert', 'AI Alert', 'Verify', 'Application', 'Track'
            ].map((step, i) => (
              <React.Fragment key={step}>
                <span style={{
                  fontSize:11, color:'var(--color-text-primary)', fontWeight:600, background:'var(--color-surface-700)',
                  border:'1px solid var(--color-border)', borderRadius:6, padding:'4px 10px'
                }}>{step}</span>
                {i < 8 && <span style={{ color:'var(--color-text-muted)' }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
