import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { apiFetch } from '../auth';

function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color }}>{icon}</div>
      <div>
        <h3>{label}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
}

function BarChart({ title, items, labelKey }) {
  const max = Math.max(...items.map(i => i.count), 1);
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      {items.map(item => (
        <div className="bar-item" key={item[labelKey]}>
          <div className="bar-label"><span>{item[labelKey]}</span><span>{item.count}</span></div>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${(item.count / max) * 100}%` }} /></div>
        </div>
      ))}
      {items.length === 0 && <p className="empty-hint">No data yet.</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/dashboard/stats')
      .then(setStats)
      .catch(e => setError(e.message));
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Welcome back! Here's your workforce overview.</div>
        {error && <div className="error-msg">{error}</div>}
        {stats ? (
          <>
            <div className="stats-grid">
              <StatCard label="Total Employees" value={stats.total} color="linear-gradient(135deg,#1a237e,#4078c0)"
                icon={<svg viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>}
              />
              <StatCard label="Avg. Salary" value={`$${Number(stats.avgSalary).toLocaleString()}`} color="linear-gradient(135deg,#00897b,#26c6da)"
                icon={<svg viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>}
              />
              <StatCard label="Departments" value={stats.byDepartment.length} color="linear-gradient(135deg,#6a1b9a,#ab47bc)"
                icon={<svg viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>}
              />
              <StatCard label="Roles" value={stats.byRole.length} color="linear-gradient(135deg,#e65100,#ff7043)"
                icon={<svg viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 16.48 1 14.64 1 13.6 1 12.8 1.48 12.2 2.38L12 2.67l-.2-.29C11.2 1.48 10.4 1 9.36 1 7.52 1 6 2.53 6 4.64c0 .48.11.92.18 1.36H4c-1.1 0-1.99.9-1.99 2L2 19c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>}
              />
            </div>
            <div className="charts-row">
              <BarChart title="Employees by Department" items={stats.byDepartment} labelKey="department" />
              <BarChart title="Employees by Role" items={stats.byRole} labelKey="role" />
            </div>
          </>
        ) : !error && <p className="empty-hint">Loading stats…</p>}
      </main>
    </div>
  );
}
