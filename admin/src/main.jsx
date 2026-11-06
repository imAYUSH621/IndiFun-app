import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Admin Portal ErrorBoundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f8fafc', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: '480px', width: '100%', background: '#1e293b', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', border: '1px solid #334155' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Admin Session Refreshed</h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              {this.state.error?.message || 'A temporary UI mismatch occurred. Click below to reload the dashboard.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', borderRadius: '8px', background: '#ff2a6d', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                Reload Dashboard
              </button>
              <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={{ padding: '10px 20px', borderRadius: '8px', background: '#334155', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                Reset Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { api, getSession, setSession, ToastProvider } from './lib.jsx';
import './admin.css';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import Rooms from './pages/Rooms.jsx';
import Catalog from './pages/Catalog.jsx';
import Finance from './pages/Finance.jsx';
import Agencies from './pages/Agencies.jsx';
import Reports from './pages/Reports.jsx';
import System from './pages/System.jsx';
import AgencyPanel from './pages/AgencyPanel.jsx';
import Trust from './pages/Trust.jsx';
import Countries from './pages/Countries.jsx';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api('/auth/admin/login', { method: 'POST', body: { email, password } });
      setSession(r);
      onLogin(r);
    } catch (x) { setErr(x.message); }
  };
  return (
    <div className="login-page">
      <form className="login-box" onSubmit={submit}>
        <div className="logo">Omnistu Live <span>Admin</span></div>
        <p className="muted">Admins and agencies sign in here.</p>
        <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoFocus /></label>
        <label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /></label>
        {err && <div className="error">{err}</div>}
        <button className="btn primary">Sign in</button>
      </form>
    </div>
  );
}

const MENU = [
  ['/', 'Dashboard', ['super', 'finance', 'moderator', 'support']],
  ['/users', 'Users & hosts', ['super', 'finance', 'moderator', 'support']],
  ['/rooms', 'Live monitor', ['super', 'moderator', 'support', 'finance']],
  ['/reports', 'Reports', ['super', 'moderator', 'support']],
  ['/trust', 'Trust & safety', ['super', 'moderator', 'support', 'finance']],
  ['/catalog', 'Gifts & store', ['super', 'finance', 'moderator', 'support']],
  ['/finance', 'Finance & payouts', ['super', 'finance']],
  ['/agencies', 'Agencies', ['super', 'finance']],
  ['/countries', 'Countries', ['super']],
  ['/system', 'System & audit', ['super']],
];

function App() {
  const [s, setS] = useState(getSession());
  if (!s) return <Login onLogin={setS} />;
  const logout = () => { setSession(null); setS(null); };
  const role = s?.admin?.role === 'super_admin' ? 'super' : (s?.admin?.role || 'super');

  if (role === 'agency') {
    return (
      <div className="layout">
        <aside className="side">
          <div className="logo">Omnistu Live <span>Agency</span></div>
          <NavLink to="/" end>My Hosts</NavLink>
          <div className="side-foot"><b>{s.admin.name}</b><small>Agency</small><button onClick={logout}>Sign out</button></div>
        </aside>
        <main className="main">
          <Routes>
            <Route path="/" element={<AgencyPanel agencyId={s.admin.agency_id} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    );
  }
  return (
    <div className="layout">
      <aside className="side">
        <div className="logo">Omnistu Live <span>Admin</span></div>
        {MENU.filter((m) => m[2].includes(role)).map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
        <div className="side-foot"><b>{s.admin.name}</b><small>{role}</small><button onClick={logout}>Sign out</button></div>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/system" element={<System />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

const adminBasename = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') ? '/admin' : '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={adminBasename}>
      <ErrorBoundary><ToastProvider><App /></ToastProvider></ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
