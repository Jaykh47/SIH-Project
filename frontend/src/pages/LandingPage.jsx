import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, CheckCircle, Shield, MapPin, Layers, FileText, BarChart3, Lock } from 'lucide-react';

/* ── Inline GIS parcel SVG illustration ─────────────────────── */
function ParcelMapSVG() {
  const parcels = [
    { d: 'M 30 20 L 90 15 L 100 65 L 55 80 Z',   fill: 'rgba(82,183,136,0.4)',  stroke: 'rgba(45,106,79,0.6)' },
    { d: 'M 100 65 L 55 80 L 60 130 L 120 125 Z', fill: 'rgba(82,183,136,0.25)', stroke: 'rgba(45,106,79,0.5)' },
    { d: 'M 90 15 L 160 10 L 170 60 L 100 65 Z',  fill: 'rgba(45,106,79,0.3)',   stroke: 'rgba(45,106,79,0.6)' },
    { d: 'M 160 10 L 220 20 L 215 75 L 170 60 Z', fill: 'rgba(82,183,136,0.35)', stroke: 'rgba(45,106,79,0.5)' },
    { d: 'M 170 60 L 215 75 L 210 130 L 165 125 Z', fill: 'rgba(45,106,79,0.2)', stroke: 'rgba(45,106,79,0.4)' },
    { d: 'M 120 125 L 165 125 L 160 175 L 115 170 Z', fill: 'rgba(82,183,136,0.3)', stroke: 'rgba(45,106,79,0.5)' },
  ];

  return (
    <svg viewBox="0 0 250 200" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(45,106,79,0.1)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="250" height="200" fill="url(#grid)" />
      {parcels.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth="1.5" />
      ))}
      {/* Road line */}
      <path d="M 0 95 L 250 90" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeDasharray="8,4" />
      {/* Pin marker */}
      <circle cx="125" cy="68" r="5" fill="var(--sb-700)" />
      <circle cx="125" cy="68" r="9" fill="rgba(45,106,79,0.2)" />
    </svg>
  );
}

/* ── Feature data ───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🗺️',
    title: 'GIS Parcel Explorer',
    desc: 'Explore georeferenced land parcels, boundaries and ULPIN information on an interactive map.',
  },
  {
    icon: '📋',
    title: 'Unified Land Records',
    desc: 'Bring registration, survey, mutation, banking parcel layouts, and public information together.',
  },
  {
    icon: '✅',
    title: 'Verified Land Information',
    desc: 'Access a parcel-centric view designed to make ownership and land information easier to understand.',
  },
  {
    icon: '🔄',
    title: 'Transparent Workflows',
    desc: 'Track registration, mutation, approvals and citizen service requests across departments.',
  },
  {
    icon: '📊',
    title: 'Data-Driven Governance',
    desc: 'Live dashboards, analytics and alerts to support faster and better land administration.',
  },
  {
    icon: '🔒',
    title: 'Secure by Design',
    desc: 'Role-based access, authentication, audit trails and interoperable API support trusted services.',
  },
];

const TRUST_ITEMS = [
  'Role-based access control',
  'Secure authentication',
  'Tamper-evident data ownership',
  'Audit trail and activity history',
  'Open API-based interoperability',
  'Scalable cloud-native architecture',
];

const DARK_CARDS = [
  { icon: '🏛️', label: 'Common parcel identity' },
  { icon: '🔗', label: 'Interoperable architecture' },
  { icon: '👤', label: 'Citizen-centric access' },
  { icon: '📈', label: 'Better governance' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('eFarm');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/login');
    }
  };

  return (
    <div className="sb-landing">
      {/* ── Navbar ────────────────────────────────────────────── */}
      <nav className="sb-navbar">
        <a className="sb-navbar-brand" href="/">
          <div className="sb-navbar-brand-icon">🌿</div>
          <div>
            <div className="sb-navbar-brand-text">SmartBhumi</div>
            <div className="sb-navbar-brand-sub">Digital Land Governance</div>
          </div>
        </a>

        <div className="sb-navbar-links">
          <a className="sb-nav-link active" href="/">Home</a>
          <a className="sb-nav-link" href="#features">Services</a>
          <a className="sb-nav-link" href="#ecosystem">About</a>
          <a className="sb-nav-link" href="#footer">Privacy</a>
        </div>

        <div className="sb-navbar-actions">
          <button className="btn btn-outline-white btn-sm" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}
            style={{ background: 'linear-gradient(135deg, #52b788, #2d6a4f)' }}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="sb-hero">
        <div>
          <div className="sb-hero-badge">
            🌐 Integrated GIS-Based Land Governance
          </div>
          <h1>
            One smart platform<br />for <span>every parcel.</span>
          </h1>
          <p>
            SmartBhumi brings land records, maps, ownership, registration, planning,
            taxation and public services together around a single parcel-centric digital identity.
          </p>
          <div className="sb-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}
              style={{ gap: 10 }}>
              Explore SmartBhumi <ArrowRight size={16} />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>
              <Search size={15} /> Search a Parcel
            </button>
          </div>
          <div className="sb-hero-meta">
            <div className="sb-hero-meta-item"><CheckCircle size={14} /> Parcel-centric data</div>
            <div className="sb-hero-meta-item"><CheckCircle size={14} /> Interoperable APIs</div>
            <div className="sb-hero-meta-item"><CheckCircle size={14} /> Citizen-first services</div>
          </div>
        </div>

        {/* GIS Widget */}
        <div className="sb-gis-widget animate-fadeInUp">
          <div className="sb-gis-widget-header">
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>ULPIN: TN-CHN-38012.6</span>
            <div className="sb-parcel-tabs" style={{ margin: 0 }}>
              {['eFarm', 'eUtility', 'eGovernor'].map(t => (
                <button
                  key={t}
                  className={`sb-parcel-tab ${activeTab === t ? 'active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="sb-gis-map-area">
            <ParcelMapSVG />
            <div className="sb-ulpin-badge">ULPIN · TN-CHN-38012.6</div>
          </div>
          <div style={{ padding: '14px 4px 0', display: 'flex', gap: 12, alignItems: 'center' }}>
            <MapPin size={14} color="var(--sb-600)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Land Parcel — Agricultural Zone</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>2.45 Acres · Ownership Verified ✓</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--sb-600)', background: 'var(--sb-50)', border: '1px solid rgba(45,106,79,0.2)', borderRadius: 6, padding: '3px 9px' }}>
              LIVE
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────────── */}
      <div className="sb-stats">
        <div className="sb-stats-grid">
          {[
            { value: '12,486+', label: 'Land Parcels' },
            { value: '9+',      label: 'Department Integrations' },
            { value: '95.6%',   label: 'Records Fully Linked' },
            { value: '24×7',    label: 'Digital Access' },
          ].map(s => (
            <div key={s.label} className="sb-stat-item">
              <div className="sb-stat-value">{s.value}</div>
              <div className="sb-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── What We Provide ───────────────────────────────────── */}
      <div id="features">
        <div className="sb-section">
          <div className="sb-section-eyebrow">WHAT WE PROVIDE</div>
          <h2>Everything connected to the land, in one place.</h2>
          <p>
            A common parcel-centric framework for citizens and departments, registrars, planners and local authorities.
          </p>
          <div className="sb-features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="sb-feature-card">
                <div className="sb-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <a href="/login" className="sb-learn-link" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                  Learn more <ArrowRight size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dark Ecosystem Section ────────────────────────────── */}
      <div id="ecosystem" className="sb-dark-section">
        <div className="sb-dark-inner">
          <div>
            <div className="sb-section-eyebrow">WHY SMARTBHUMI?</div>
            <h2 style={{ color: '#ffffff', fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 16px' }}>
              From fragmented records to a<br />connected land ecosystem.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.75, maxWidth: 460, margin: '0 0 32px' }}>
              SmartBhumi connects distributed land datasets while preserving departmental
              responsibilities, helping citizens and government teams access a consistent parcel-centric view.
            </p>
            <div className="sb-dark-cards">
              {DARK_CARDS.map(c => (
                <div key={c.label} className="sb-dark-card">
                  <div className="sb-dark-card-icon">{c.icon}</div>
                  {c.label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '28px 24px',
            }}>
              <div className="sb-trust-header">Trusted digital foundation</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
                Designed for public-sector workflows
              </div>
              <div className="sb-trust-list">
                {TRUST_ITEMS.map(t => (
                  <div key={t} className="sb-trust-item">
                    <div className="sb-trust-check">✓</div>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA Section ───────────────────────────────────────── */}
      <div className="sb-cta">
        <div className="sb-cta-inner">
          <div className="sb-cta-eyebrow">START EXPLORING</div>
          <h2>Find the land information you need.</h2>
          <p>Search a demo parcel and explore how integrated land services can simplify governance.</p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn btn-lg"
              style={{ background: '#ffffff', color: 'var(--sb-800)', fontWeight: 700 }}
            >
              <Search size={16} /> Search Parcel →
            </button>
          </form>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer id="footer" className="sb-footer">
        <div className="sb-footer-grid">
          <div className="sb-footer-brand">
            <a className="sb-navbar-brand" href="/" style={{ marginBottom: 12, display: 'inline-flex' }}>
              <div className="sb-navbar-brand-icon" style={{ width: 32, height: 32 }}>🌿</div>
              <div>
                <div className="sb-navbar-brand-text" style={{ fontSize: 16 }}>SmartBhumi</div>
                <div className="sb-navbar-brand-sub">Digital Land Governance</div>
              </div>
            </a>
            <p>
              SmartBhumi is a prototype concept for integrated GIS-based digital land
              governance. It demonstrates how land datasets and services can be connected
              around a common parcel identity.
            </p>
          </div>
          <div className="sb-footer-col">
            <h4>Important Links</h4>
            <a className="sb-footer-link" href="/">Home</a>
            <a className="sb-footer-link" href="#features">Services</a>
            <a className="sb-footer-link" href="#ecosystem">About</a>
            <a className="sb-footer-link" href="#footer">Privacy Policy</a>
          </div>
          <div className="sb-footer-col">
            <h4>Privacy &amp; Security</h4>
            <a className="sb-footer-link" href="#">Terms and Conditions</a>
            <a className="sb-footer-link" href="#">Accessibility</a>
            <a className="sb-footer-link" href="#">Demo records disclosed</a>
          </div>
        </div>
        <div className="sb-footer-bottom">
          <span>© 2026 SmartBhumi — Prototype</span>
          <span>Privacy Policy · Terms of Use · Accessibility Statement</span>
        </div>
      </footer>
    </div>
  );
}
