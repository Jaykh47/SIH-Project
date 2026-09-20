// Auth context — manages login state across the whole app
// Includes local demo-mode fallback when backend is unavailable
//
// NOTE: AuthProvider is the default export (component) and useAuth is a
// named export (hook). They live in the same file intentionally — Vite Fast
// Refresh works fine with this pattern as long as the default export is the
// component. The named hook is treated as a non-component export.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

// ── Demo accounts (mirrors database seed + authController demo logic) ──────
// Used ONLY when the backend API is unreachable (dev without Docker / backend)
const DEMO_ACCOUNTS = [
  { email: 'admin@landstack.gov',       password: 'Admin@123',   userId: 1, fullName: 'System Administrator', roleName: 'admin',                department: 'IT Department'     },
  { email: 'revenue@wb.gov',            password: 'Officer@123', userId: 2, fullName: 'Rajesh Patel',         roleName: 'revenue_officer',      department: 'Revenue Dept WB'   },
  { email: 'registration@wb.gov',       password: 'Officer@123', userId: 3, fullName: 'Kavita Sharma',        roleName: 'registration_officer', department: 'Registration Dept' },
  { email: 'municipality@durgapur.gov', password: 'Officer@123', userId: 4, fullName: 'Sanjay Mukherjee',    roleName: 'municipality_officer', department: 'Durgapur MC'       },
  { email: 'survey@wb.gov',             password: 'Officer@123', userId: 5, fullName: 'Amit Dutta',           roleName: 'survey_officer',       department: 'Survey Dept WB'    },
  { email: 'citizen@demo.com',          password: 'Citizen@123', userId: 6, fullName: 'Ravi Kumar Sharma',   roleName: 'citizen',              department: null                },
];

function makeDemoToken(userData) {
  const payload = btoa(JSON.stringify({ ...userData, exp: Date.now() + 86400000 }));
  return `demo.${payload}.local`;
}

function localDemoLogin(email, password) {
  const match = DEMO_ACCOUNTS.find(
    a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );
  if (!match) throw new Error('Invalid email or password.');
  const { password: _pw, ...userData } = match;
  return { token: makeDemoToken(userData), user: userData };
}

// ── AuthProvider (default export — satisfies Fast Refresh) ──────────────────
export default function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('landstack_token');
    const saved = localStorage.getItem('landstack_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Always attempt real backend first
      const res = await authAPI.login(email, password);
      const { token, user: userData } = res.data.data;
      localStorage.setItem('landstack_token', token);
      localStorage.setItem('landstack_user', JSON.stringify(userData));
      localStorage.removeItem('landstack_demo_mode');
      setUser(userData);
      return userData;
    } catch (err) {
      // Vite dev proxy returns 502/503 when backend is down;
      // raw axios gets ERR_NETWORK / no response. Treat all as "offline".
      const status = err.response?.status;
      const isOffline =
        !err.response ||
        err.code === 'ERR_NETWORK' ||
        err.isBackendOffline ||
        status === 502 || status === 503 || status === 504;

      if (isOffline) {
        // Demo-mode fallback — authenticate locally
        const { token, user: userData } = localDemoLogin(email, password);
        localStorage.setItem('landstack_token', token);
        localStorage.setItem('landstack_user', JSON.stringify(userData));
        localStorage.setItem('landstack_demo_mode', 'true');
        setUser(userData);
        return userData;
      }

      // Real error from the backend (e.g. wrong password) — re-throw
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('landstack_token');
    localStorage.removeItem('landstack_user');
    localStorage.removeItem('landstack_demo_mode');
    setUser(null);
  };

  const isOfficer  = () => user && user.roleName !== 'citizen';
  const isAdmin    = () => user && user.roleName === 'admin';
  const isCitizen  = () => user && user.roleName === 'citizen';
  const isDemoMode = () => localStorage.getItem('landstack_demo_mode') === 'true';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isOfficer, isAdmin, isCitizen, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth hook (named export) ─────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
