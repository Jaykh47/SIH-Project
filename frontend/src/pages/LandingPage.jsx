import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, CheckCircle, Shield, MapPin, Layers, FileText, BarChart3, Lock } from 'lucide-react';
import LoginModal from '../components/Auth/LoginModal';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../hooks/useTheme';

/* ── Inline GIS parcel SVG illustration ─────────────────────── */
function ParcelMapSVG({ isDark }) {
  const parcels = [
    { d: 'M 30 20 L 90 15 L 100 65 L 55 80 Z',
      fill: isDark ? 'rgba(82,183,136,0.35)' : 'rgba(82,183,136,0.4)',
      stroke: isDark ? 'rgba(82,183,136,0.8)' : 'rgba(45,106,79,0.6)' },
    { d: 'M 100 65 L 55 80 L 60 130 L 120 125 Z',
      fill: isDark ? 'rgba(82,183,136,0.22)' : 'rgba(82,183,136,0.25)',
      stroke: isDark ? 'rgba(82,183,136,0.7)' : 'rgba(45,106,79,0.5)' },
    { d: 'M 90 15 L 160 10 L 170 60 L 100 65 Z',
      fill: isDark ? 'rgba(45,106,79,0.4)' : 'rgba(45,106,79,0.3)',
      stroke: isDark ? 'rgba(82,183,136,0.85)' : 'rgba(45,106,79,0.6)' },
    { d: 'M 160 10 L 220 20 L 215 75 L 170 60 Z',
      fill: isDark ? 'rgba(82,183,136,0.3)' : 'rgba(82,183,136,0.35)',
      stroke: isDark ? 'rgba(82,183,136,0.75)' : 'rgba(45,106,79,0.5)' },
    { d: 'M 170 60 L 215 75 L 210 130 L 165 125 Z',
      fill: isDark ? 'rgba(45,106,79,0.3)' : 'rgba(45,106,79,0.2)',
      stroke: isDark ? 'rgba(82,183,136,0.65)' : 'rgba(45,106,79,0.4)' },
    { d: 'M 120 125 L 165 125 L 160 175 L 115 170 Z',
      fill: isDark ? 'rgba(82,183,136,0.28)' : 'rgba(82,183,136,0.3)',
      stroke: isDark ? 'rgba(82,183,136,0.75)' : 'rgba(45,106,79,0.5)' },
  ];

  return (
    <svg viewBox="0 0 250 200" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={isDark ? "grid-dark" : "grid"} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={isDark ? "rgba(82,183,136,0.18)" : "rgba(45,106,79,0.1)"} strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="250" height="200" fill={`url(#${isDark ? "grid-dark" : "grid"})`} />
      {parcels.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth="1.5" />
      ))}
      {/* Road line */}
      <path d="M 0 95 L 250 90" stroke={isDark ? "rgba(226,232,240,0.5)" : "rgba(255,255,255,0.7)"} strokeWidth="3" strokeDasharray="8,4" />
      {/* Pin marker */}
      <circle cx="125" cy="68" r="5" fill="#10b981" />
      <circle cx="125" cy="68" r="9" fill={isDark ? "rgba(82,183,136,0.4)" : "rgba(45,106,79,0.2)"} />
      <circle cx="125" cy="68" r="14" fill={isDark ? "rgba(82,183,136,0.15)" : "rgba(45,106,79,0.08)"} />
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
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('eFarm');
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoginModalOpen(true);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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
          <a className="sb-nav-link" href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Services</a>
          <a className="sb-nav-link" href="#ecosystem" onClick={(e) => { e.preventDefault(); scrollToSection('ecosystem'); }}>About</a>
          <a className="sb-nav-link" href="#privacy" onClick={(e) => { e.preventDefault(); scrollToSection('privacy'); }}>Privacy</a>
        </div>

        <div className="sb-navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          <button className="btn btn-outline-white btn-sm" onClick={() => setLoginModalOpen(true)}>Login</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth?tab=signup')}
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
            <button className="btn btn-primary btn-lg" onClick={() => scrollToSection('features')}
              style={{ gap: 10 }}>
              Explore SmartBhumi <ArrowRight size={16} />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => setLoginModalOpen(true)}>
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
            <ParcelMapSVG isDark={isDark} />
            <div className="sb-ulpin-badge">ULPIN · TN-CHN-38012.6</div>
          </div>
          <div className="sb-gis-meta-bar">
            <MapPin size={14} className="sb-gis-pin-icon" style={{ flexShrink: 0 }} />
            <div>
              <div className="sb-gis-title">Land Parcel — Agricultural Zone</div>
              <div className="sb-gis-sub">2.45 Acres · Ownership Verified ✓</div>
            </div>
            <div className="sb-gis-live-badge">
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
                <a href="#login" className="sb-learn-link" onClick={(e) => { e.preventDefault(); setLoginModalOpen(true); }}>
                  Learn more <ArrowRight size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dark Ecosystem Section ────────────────────────────── */}
      {/* ── Dark Ecosystem Section (About) ──────────────────── */}
      <div id="ecosystem" className="sb-dark-section">
        <div className="sb-dark-inner">
          <div>
            <div className="sb-section-eyebrow">ABOUT SMARTBHUMI</div>
            <h2 style={{ color: '#ffffff', fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 16px' }}>
              From fragmented records to a<br />connected land ecosystem.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.75, maxWidth: 460, margin: '0 0 32px' }}>
              SmartBhumi connects distributed land datasets across registration, survey, revenue,
              and town planning while preserving statutory authority, empowering citizens and
              administrators with a verified, parcel-centric single source of truth.
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
            <div className="sb-trust-container">
              <div className="sb-trust-header">Trusted Digital Foundation</div>
              <div className="sb-trust-sub">
                Designed for government-grade public sector workflows
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

      {/* ── Dedicated Privacy & Statutory Architecture Section ── */}
      <div id="privacy" className="sb-privacy-section">
        <div className="sb-privacy-inner">
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
            <div className="sb-section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} /> STATUTORY PRIVACY &amp; DATA SECURITY
            </div>
            <h2>Sovereign Data Privacy by Design</h2>
            <p className="sb-privacy-desc">
              SmartBhumi implements zero-trust spatial firewalls, consent-driven citizen access,
              and immutable cryptographic verification aligned with India's DPDP Act 2023.
            </p>
          </div>

          <div className="sb-privacy-grid">
            <div className="sb-privacy-card">
              <div className="sb-privacy-card-icon">
                <Shield size={22} />
              </div>
              <h3>Consent-Driven Access</h3>
              <p>
                No land record, survey plot, or encumbrance history is disclosed without explicit
                citizen OTP or tokenized authorization recorded in a tamper-proof consent log.
              </p>
              <div className="sb-privacy-badge">DPDP Act §6 Compliant</div>
            </div>

            <div className="sb-privacy-card">
              <div className="sb-privacy-card-icon">
                <Lock size={22} />
              </div>
              <h3>Cryptographic Identity</h3>
              <p>
                Aadhaar and PAN details are never stored in plaintext. Salting and SHA-256
                zero-knowledge identity tokens are used for inter-departmental federation.
              </p>
              <div className="sb-privacy-badge">Zero-Knowledge ID</div>
            </div>

            <div className="sb-privacy-card">
              <div className="sb-privacy-card-icon">
                <Layers size={22} />
              </div>
              <h3>Spatial Role Firewalls</h3>
              <p>
                Granular multi-tenant spatial permissions ensure registrars, town planners, and
                revenue officers access only the parcels within their authorized jurisdiction.
              </p>
              <div className="sb-privacy-badge">Granular RBAC</div>
            </div>

            <div className="sb-privacy-card">
              <div className="sb-privacy-card-icon">
                <FileText size={22} />
              </div>
              <h3>Immutable Audit Ledger</h3>
              <p>
                Every deed verification, mutation request, boundary change, and citizen query is
                permanently timestamped with verifiable cryptographic signatures.
              </p>
              <div className="sb-privacy-badge">Tamper-Evident Ledger</div>
            </div>
          </div>

          <div className="sb-privacy-trust-bar">
            <div className="sb-privacy-trust-item">
              <CheckCircle size={16} color="#52b788" /> DPDP Act 2023 Statutory Alignment
            </div>
            <div className="sb-privacy-trust-item">
              <CheckCircle size={16} color="#52b788" /> 256-bit AES &amp; TLS 1.3 Encryption
            </div>
            <div className="sb-privacy-trust-item">
              <CheckCircle size={16} color="#52b788" /> CERT-In Cyber Security Guidelines
            </div>
            <div className="sb-privacy-trust-item">
              <CheckCircle size={16} color="#52b788" /> Synthetic Sandbox (Zero Live PII)
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
              className="btn btn-lg sb-cta-btn"
              style={{ fontWeight: 700 }}
            >
              <Search size={16} /> Search Demo Parcel →
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
              SmartBhumi is an integrated GIS-based digital land governance platform.
              It interconnects land records, spatial boundaries, and departmental workflows
              around a unified digital parcel identity.
            </p>
          </div>
          <div className="sb-footer-col">
            <h4>Platform Services</h4>
            <a className="sb-footer-link" href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home Overview</a>
            <a className="sb-footer-link" href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Cadastral Services</a>
            <a className="sb-footer-link" href="#ecosystem" onClick={(e) => { e.preventDefault(); scrollToSection('ecosystem'); }}>About Ecosystem</a>
            <a className="sb-footer-link" href="#privacy" onClick={(e) => { e.preventDefault(); scrollToSection('privacy'); }}>Data Privacy Architecture</a>
          </div>
          <div className="sb-footer-col">
            <h4>Privacy &amp; Compliance</h4>
            <a className="sb-footer-link" href="#privacy" onClick={(e) => { e.preventDefault(); scrollToSection('privacy'); }}>DPDP Act 2023 Compliance</a>
            <a className="sb-footer-link" href="#privacy" onClick={(e) => { e.preventDefault(); scrollToSection('privacy'); }}>Zero-Trust Cryptography</a>
            <a className="sb-footer-link" href="#privacy" onClick={(e) => { e.preventDefault(); scrollToSection('privacy'); }}>Synthetic Sandbox Safe</a>
            <a className="sb-footer-link" href="#privacy" onClick={(e) => { e.preventDefault(); scrollToSection('privacy'); }}>Audit &amp; Access Controls</a>
          </div>
        </div>
        <div className="sb-footer-bottom">
          <span>© 2026 SmartBhumi — Digital Land Governance Architecture</span>
          <span>DPDP Act 2023 Compliant · ISO 27001 Foundation · CERT-In Aligned</span>
        </div>
      </footer>

      {/* ── Interactive Login Modal ────────────────────────────── */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}
