import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Phone, User, Fingerprint, MapPin, Building2, Home, Hash, AlertTriangle, CheckCircle, ArrowLeft, Shield } from 'lucide-react';

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const DISTRICTS_MAP = {
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Burdwan', 'Bankura'],
  'Tamil Nadu':  ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
};

/* ── GIS Map Parcel SVG for right panel ─────────────────────── */
function ShowcaseMapSVG() {
  return (
    <svg viewBox="0 0 300 180" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid2" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M 18 0 L 0 0 0 18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="300" height="180" fill="url(#grid2)" />
      {[
        { d: 'M 20 20 L 95 12 L 110 72 L 50 85 Z',     fill: 'rgba(82,183,136,0.45)' },
        { d: 'M 95 12 L 175 8 L 185 68 L 110 72 Z',    fill: 'rgba(45,106,79,0.4)'  },
        { d: 'M 175 8 L 250 15 L 245 80 L 185 68 Z',   fill: 'rgba(82,183,136,0.3)' },
        { d: 'M 50 85 L 110 72 L 120 140 L 55 145 Z',  fill: 'rgba(45,106,79,0.35)' },
        { d: 'M 110 72 L 185 68 L 195 135 L 120 140 Z',fill: 'rgba(82,183,136,0.5)' },
        { d: 'M 185 68 L 245 80 L 240 148 L 195 135 Z',fill: 'rgba(45,106,79,0.25)' },
      ].map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
      ))}
      {/* Road */}
      <path d="M 0 100 L 300 95" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeDasharray="10,5" />
      {/* Pin */}
      <circle cx="150" cy="100" r="6" fill="#ffffff" />
      <circle cx="150" cy="100" r="11" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

/* ── Info Card ───────────────────────────────────────────────── */
function InfoCard({ icon, title, value, sub }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: 'rgba(82,183,136,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit, sans-serif', marginTop: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: 'rgba(82,183,136,0.9)', marginTop: 1, fontWeight: 500 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', phone: '', aadhar: '', email: '',
    otp: '', state: '', district: '', city: '', pincode: '', password: '',
  });
  const [otpSent,  setOtpSent]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const districts = DISTRICTS_MAP[form.state] || [];

  const handleSendOtp = () => {
    if (form.email) setOtpSent(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    // Simulate API call — swap with real authAPI.register() when available
    try {
      await new Promise(r => setTimeout(r, 1200));
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdf4, #f8faf9)',
      }}>
        <div style={{ textAlign: 'center', padding: 48 }} className="animate-fadeInUp">
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
            Account Created!
          </h2>
          <p style={{ color: '#475569', fontSize: 15 }}>Redirecting you to sign in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sb-register-layout">
      {/* ── Left: Form ──────────────────────────────────────── */}
      <div className="sb-register-left">
        {/* Back to home */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13, fontWeight: 500, textDecoration: 'none', marginBottom: 32, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--sb-700)'}
          onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #52b788, #2d6a4f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 2px 8px rgba(45,106,79,0.3)',
          }}>🌿</div>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 16, color: '#0f172a' }}>SmartBhumi</div>
            <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Digital Land Governance</div>
          </div>
        </div>

        {/* Secure badge */}
        <div className="sb-secure-badge" style={{ marginBottom: 24 }}>
          <Shield size={12} /> Secure citizen account
        </div>

        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Create your account
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 28px' }}>
          Register to access your digital land records and services.
        </p>

        {error && (
          <div className="sb-error-box" style={{ marginBottom: 20 }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Full Name + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="sb-label">Full Name</label>
              <div className="sb-input-wrap">
                <User size={14} className="sb-input-icon" />
                <input className="sb-input" type="text" value={form.fullName} onChange={set('fullName')} placeholder="Enter your full name" required />
              </div>
            </div>
            <div>
              <label className="sb-label">Phone Number</label>
              <div className="sb-input-wrap">
                <Phone size={14} className="sb-input-icon" />
                <input className="sb-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="10-digit number" maxLength={10} required />
              </div>
            </div>
          </div>

          {/* Row 2: Aadhar + Gmail */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="sb-label">Aadhar Number</label>
              <div className="sb-input-wrap">
                <Fingerprint size={14} className="sb-input-icon" />
                <input className="sb-input" type="text" value={form.aadhar} onChange={set('aadhar')} placeholder="XXXX XXXX XXXX" maxLength={14} required />
              </div>
            </div>
            <div>
              <label className="sb-label">Gmail ID</label>
              <div className="sb-input-wrap">
                <Mail size={14} className="sb-input-icon" />
                <input className="sb-input" type="email" value={form.email} onChange={set('email')} placeholder="example@gmail.com" required />
              </div>
            </div>
          </div>

          {/* Email OTP */}
          <div style={{ marginBottom: 16 }}>
            <label className="sb-label">Email OTP</label>
            <div className="sb-otp-row">
              <input
                className="sb-otp-input"
                type="text"
                value={form.otp}
                onChange={set('otp')}
                placeholder="· · · ·"
                maxLength={6}
              />
              <button type="button" className="sb-send-otp-btn" onClick={handleSendOtp}>
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>
            {otpSent && (
              <div style={{ fontSize: 11, color: 'var(--sb-600)', marginTop: 5, fontWeight: 500 }}>
                OTP sent to {form.email}
              </div>
            )}
          </div>

          {/* Location Details */}
          <div className="sb-section-divider">
            <MapPin size={12} /> Location Details
          </div>

          {/* Row 3: State + District */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="sb-label">State</label>
              <div className="sb-input-wrap">
                <Building2 size={14} className="sb-input-icon" />
                <select className="sb-select" value={form.state} onChange={set('state')} required>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="sb-label">District</label>
              <div className="sb-input-wrap">
                <MapPin size={14} className="sb-input-icon" />
                <select className="sb-select" value={form.district} onChange={set('district')} required>
                  <option value="">Select district</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Row 4: City + Pincode */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="sb-label">City / Village</label>
              <div className="sb-input-wrap">
                <Home size={14} className="sb-input-icon" />
                <input className="sb-input" type="text" value={form.city} onChange={set('city')} placeholder="Enter city or village" required />
              </div>
            </div>
            <div>
              <label className="sb-label">Pincode</label>
              <div className="sb-input-wrap">
                <Hash size={14} className="sb-input-icon" />
                <input className="sb-input" type="text" value={form.pincode} onChange={set('pincode')} placeholder="Enter 6-digit pincode" maxLength={6} required />
              </div>
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <label className="sb-label">Password</label>
            <div className="sb-input-wrap">
              <Lock size={14} className="sb-input-icon" />
              <input
                className="sb-input"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Enter your password"
                required
                style={{ paddingRight: 44 }}
              />
              <button type="button" className="sb-input-action" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>
              ⓘ Must contain at least 8 characters.
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="sb-signin-btn"
            disabled={loading}
            style={{ marginTop: 24 }}
          >
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <div className="sb-info-text" style={{ marginTop: 16 }}>
          Already have an account?{' '}
          <Link to="/login" className="sb-link">Sign in</Link>
        </div>
      </div>

      {/* ── Right: Showcase ──────────────────────────────────── */}
      <div className="sb-register-right">
        {/* Back to home - top right */}
        <Link
          to="/"
          style={{
            position: 'absolute', top: 24, right: 24,
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 9, padding: '8px 16px',
            color: '#ffffff', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', backdropFilter: 'blur(8px)',
            transition: 'background 0.15s',
            zIndex: 10,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <ArrowLeft size={13} /> Back to Home
        </Link>

        {/* GIS Powered badge */}
        <div style={{
          position: 'absolute', top: 24, left: 24,
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(82,183,136,0.15)',
          border: '1px solid rgba(82,183,136,0.25)',
          borderRadius: 9, padding: '8px 14px',
          color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600,
          zIndex: 10,
        }}>
          🌐 GIS Powered Land Platform
        </div>

        {/* Showcase card */}
        <div className="sb-register-showcase animate-fadeInUp">
          {/* Map header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🗺️</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Digital Land Map</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Cadastral information</div>
              </div>
            </div>
            <div style={{
              background: 'rgba(82,183,136,0.25)', border: '1px solid rgba(82,183,136,0.4)',
              borderRadius: 6, padding: '3px 10px',
              fontSize: 10, fontWeight: 700, color: 'var(--sb-400)', letterSpacing: '0.06em',
            }}>LIVE</div>
          </div>

          {/* Map */}
          <div className="sb-map-preview">
            <ShowcaseMapSVG />
            {/* Parcel info overlay */}
            <div style={{
              position: 'absolute', top: 10, left: 10,
              background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '10px 14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ fontSize: 16 }}>🌿</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--sb-600)', background: 'var(--sb-50)', border: '1px solid rgba(45,106,79,0.2)', borderRadius: 4, padding: '1px 7px' }}>VERIFIED</div>
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>Land Parcel</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>2.45 Acres</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <CheckCircle size={10} color="var(--sb-600)" />
                <span style={{ fontSize: 10, color: 'var(--sb-700)', fontWeight: 600 }}>Ownership verified</span>
              </div>
            </div>
            {/* Location bubble */}
            <div style={{
              position: 'absolute', bottom: 10, right: 10,
              background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '10px 14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)', textAlign: 'right',
            }}>
              <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>Registered Location</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>Bankura</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
                <MapPin size={9} color="var(--sb-600)" />
                <span style={{ fontSize: 9, color: 'var(--sb-700)', fontWeight: 600 }}>Digital land records connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="sb-register-tagline">
          <div style={{ fontSize: 32, marginBottom: 16 }}>🌿</div>
          <h2>
            Your Land. Your Records.<br />
            <span>One Digital Platform.</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
