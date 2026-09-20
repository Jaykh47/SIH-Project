import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthContext';
import { Mail, Lock, Eye, EyeOff, AlertTriangle, X, Shield, Zap } from 'lucide-react';

const DEMO_USERS = [
  { email: 'revenue@wb.gov',            password: 'Officer@123', role: 'Revenue Officer',      color: '#10b981' },
  { email: 'municipality@durgapur.gov', password: 'Officer@123', role: 'Municipality Officer', color: '#8b5cf6' },
  { email: 'survey@wb.gov',             password: 'Officer@123', role: 'Survey Officer',        color: '#06b6d4' },
  { email: 'registration@wb.gov',       password: 'Officer@123', role: 'Registration Officer', color: '#3b82f6' },
  { email: 'admin@landstack.gov',        password: 'Admin@123',   role: 'Administrator',        color: '#f59e0b' },
  { email: 'citizen@demo.com',           password: 'Citizen@123', role: 'Citizen',              color: '#94a3b8' },
];

/* ── Green gradient background ───────────────────────────────── */
function BgPreview() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      background: 'linear-gradient(135deg, #e8f5ee 0%, #f0fdf4 35%, #f8faf9 65%, #e6f0ea 100%)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-15%', left: '-8%',
        width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(45,106,79,0.15) 0%, transparent 65%)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-8%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(82,183,136,0.12) 0%, transparent 65%)',
        borderRadius: '50%',
      }} />
      {/* Blurred hero text in background */}
      <div style={{
        position: 'absolute', top: '18%', left: '10%',
        filter: 'blur(5px)', opacity: 0.25, userSelect: 'none', pointerEvents: 'none',
      }}>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 54, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
          One smart platform<br /><span style={{ color: 'var(--sb-600)' }}>for every parcel.</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /* Click a demo button → fill fields + submit immediately */
  const fillAndLogin = async (u) => {
    setError('');
    setEmail(u.email);
    setPassword(u.password);
    setLoading(true);
    try {
      await login(u.email, u.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
    }}>
      <BgPreview />

      {/* ── Login card ────────────────────────────────────────── */}
      <div className="sb-login-card animate-fadeInUp" style={{ maxWidth: 440 }}>

        {/* ── Card header ─────────────────────────────────────── */}
        <div className="sb-login-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #52b788, #2d6a4f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: '0 2px 8px rgba(45,106,79,0.3)',
            }}>🌿</div>
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                SmartBhumi
              </div>
              <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Secure Sign In
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, borderRadius: 6 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Card body ───────────────────────────────────────── */}
        <div className="sb-login-body">
          {/* Secure badge */}
          <div className="sb-secure-badge">
            <Shield size={12} /> Secure citizen account
          </div>

          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800,
            color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em',
          }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 22px' }}>
            Sign in to access your land records and services.
          </p>

          {/* ── Login form ──────────────────────────────────────── */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label className="sb-label">Email Address</label>
              <div className="sb-input-wrap">
                <Mail size={15} className="sb-input-icon" />
                <input
                  className="sb-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="officer@department.gov.in"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 22 }}>
              <label className="sb-label">Password</label>
              <div className="sb-input-wrap">
                <Lock size={15} className="sb-input-icon" />
                <input
                  className="sb-input"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  className="sb-input-action"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="sb-error-box">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="sb-signin-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className="sb-info-text" style={{ marginTop: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" className="sb-link">Create account</Link>
          </div>

          {/* ── Demo accounts — always visible ──────────────────── */}
          <div style={{
            marginTop: 20,
            background: 'linear-gradient(135deg, #f0fdf4, #f8faf9)',
            border: '1px solid rgba(45,106,79,0.15)',
            borderRadius: 12,
            padding: '14px 16px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 700, color: 'var(--sb-700)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: 12,
            }}>
              <Zap size={12} /> Quick Demo Login — click any role
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {DEMO_USERS.map(u => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => fillAndLogin(u)}
                  disabled={loading}
                  style={{
                    background: `${u.color}12`,
                    border: `1.5px solid ${u.color}40`,
                    borderRadius: 9, padding: '8px 12px',
                    color: u.color, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                    opacity: loading ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${u.color}22`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${u.color}12`; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div>{u.role}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2, fontWeight: 500, fontFamily: 'monospace' }}>
                    {u.email}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
