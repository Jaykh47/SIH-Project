import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthContext';
import {
  LayoutDashboard, Map, Search, Bell, FileText,
  Briefcase, LogOut, User, Route, Users, Zap
} from 'lucide-react';

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, exact: true },
  { to: '/map',          label: 'GIS Map',       icon: Map },
  { to: '/search',       label: 'Search',        icon: Search },
  { to: '/workflows',    label: 'Workflows',     icon: Route },
  { to: '/alerts',       label: 'Alerts',        icon: Bell,      officerOnly: true },
  { to: '/applications', label: 'Applications',  icon: FileText },
  { to: '/services',     label: 'Services',      icon: Briefcase, citizenOnly: true },
];

const DEMO_ROLES = [
  { email: 'citizen@demo.com',           password: 'Citizen@123', label: 'Citizen (Ravi Kumar)',         roleName: 'citizen' },
  { email: 'revenue@wb.gov',            password: 'Officer@123', label: 'Revenue Officer (Rajesh Patel)', roleName: 'revenue_officer' },
  { email: 'registration@wb.gov',       password: 'Officer@123', label: 'Registration Officer (Kavita)',  roleName: 'registration_officer' },
  { email: 'municipality@durgapur.gov', password: 'Officer@123', label: 'Municipality Officer (Sanjay)',  roleName: 'municipality_officer' },
  { email: 'survey@wb.gov',             password: 'Officer@123', label: 'Survey Officer (Amit Dutta)',    roleName: 'survey_officer' },
  { email: 'admin@landstack.gov',        password: 'Admin@123',   label: 'Administrator (System Admin)', roleName: 'admin' },
];

const ROLE_COLOR = {
  admin:                '#f59e0b',
  revenue_officer:      '#10b981',
  registration_officer: '#3b82f6',
  municipality_officer: '#8b5cf6',
  survey_officer:       '#06b6d4',
  citizen:              '#94a3b8',
};

const ROLE_LABEL = {
  admin:                'Administrator',
  revenue_officer:      'Revenue Officer',
  registration_officer: 'Registration Officer',
  municipality_officer: 'Municipality Officer',
  survey_officer:       'Survey Officer',
  citizen:              'Citizen',
};

export default function MainLayout() {
  const { user, login, logout, isOfficer, isCitizen } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleRoleSwitch = async (email, password) => {
    try {
      await login(email, password);
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  const roleColor = ROLE_COLOR[user?.roleName] || '#94a3b8';
  const roleLabel = ROLE_LABEL[user?.roleName] || user?.roleName?.replace(/_/g, ' ') || 'User';

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--color-surface-900)' }}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #52b788, #2d6a4f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
              boxShadow: '0 2px 8px rgba(45,106,79,0.3)',
            }}>🌿</div>
            <div>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                fontSize: 16, color: '#0f172a', letterSpacing: '-0.02em',
              }}>
                Smart<span style={{ color: 'var(--sb-600)' }}>Bhumi</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--sb-600)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Land Governance
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 14px 10px' }}>
            Navigation
          </div>
          {NAV.map(item => {
            if (item.officerOnly && !isOfficer()) return null;
            if (item.citizenOnly && !isCitizen()) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <item.icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User info & quick persona */}
        <div style={{ padding: '14px 14px 18px', borderTop: '1px solid rgba(45,106,79,0.1)' }}>
          {/* Disclaimer */}
          <div className="disclaimer-banner" style={{ marginBottom: 12, fontSize: 10 }}>
            ⚠️ SYNTHETIC DATA — Demo Only
          </div>

          {/* User card */}
          <div style={{
            background: 'var(--sb-50)',
            border: '1px solid rgba(45,106,79,0.12)',
            borderRadius: 10,
            padding: '10px 12px',
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `${roleColor}18`,
                border: `2px solid ${roleColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <User size={14} color={roleColor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.fullName}
                </div>
                <div style={{
                  display: 'inline-block',
                  fontSize: 9.5, fontWeight: 600, color: roleColor,
                  background: `${roleColor}15`,
                  borderRadius: 4, padding: '1px 6px',
                  marginTop: 2,
                }}>
                  {roleLabel}
                </div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '6px 10px' }}
            onClick={handleLogout}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content area with header role switcher ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Topbar Utility Ribbon */}
        <header style={{
          height: 48, background: '#ffffff', borderBottom: '1px solid rgba(45,106,79,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#64748b' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span>Digital Public Infrastructure (DPI) · SIH 2026 Pilot</span>
          </div>

          {/* Persona Switcher (IntegratedDashboard Topbar Feature) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={12} /> Switch Persona:
            </span>
            <select
              value={user?.roleName || 'citizen'}
              onChange={e => {
                const target = DEMO_ROLES.find(r => r.roleName === e.target.value);
                if (target) handleRoleSwitch(target.email, target.password);
              }}
              style={{
                fontSize: 11, fontWeight: 600, color: '#0f172a', background: '#f0fdf4',
                border: '1px solid #a7f3d0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer'
              }}
            >
              {DEMO_ROLES.map(r => (
                <option key={r.roleName} value={r.roleName}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Dynamic Route View */}
        <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
