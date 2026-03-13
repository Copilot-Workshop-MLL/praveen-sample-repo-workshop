import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Sidebar from '../components/Sidebar';
import { apiFetch } from '../auth';

// ── Colour-threshold constants ────────────────────────────────
const SALARY_TARGET      = 70_000;  // below → amber/yellow
const SALARY_ABOVE       = 90_000;  // at or above → green
const DEPT_UNDERSTAFFED  = 3;       // count < this → red bars
const DEPT_HEALTHY       = 5;       // count >= this → green bars
const MAX_SALARY_RING    = 150_000; // ring at 100% for this salary
const MAX_DEPT_RING      = 20;      // ring at 100% for this many depts/roles
const MAX_EMPLOYEES_RING = 500;     // ring at 100% for this headcount

// ── Count-up animation hook ───────────────────────────────────
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
    let raf;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

// ── Circular progress ring ────────────────────────────────────
function ProgressRing({ percent, size = 56, strokeWidth = 5 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(Math.max(percent, 0), 100) / 100);
  return (
    <svg width={size} height={size} className="progress-ring" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.85)" strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" className="progress-ring-circle" />
    </svg>
  );
}
ProgressRing.propTypes = {
  percent:     PropTypes.number.isRequired,
  size:        PropTypes.number,
  strokeWidth: PropTypes.number,
};

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, numericValue, format, color, icon, ringPercent }) {
  const animated = useCountUp(numericValue);
  const display = format ? format(animated) : String(animated);
  const animatedRing = numericValue > 0 ? (animated / numericValue) * ringPercent : 0;
  return (
    <div className="stat-card">
      <div className="stat-icon-wrap">
        <div className="stat-icon stat-icon-pulse" style={{ background: color }}>{icon}</div>
        <ProgressRing percent={animatedRing} />
      </div>
      <div>
        <h3>{label}</h3>
        <p>{display}</p>
      </div>
    </div>
  );
}
StatCard.propTypes = {
  label:        PropTypes.string.isRequired,
  numericValue: PropTypes.number.isRequired,
  format:       PropTypes.func,
  color:        PropTypes.string.isRequired,
  icon:         PropTypes.element.isRequired,
  ringPercent:  PropTypes.number.isRequired,
};

// ── Salary gradient colour based on threshold ─────────────────
function getSalaryColor(salary) {
  if (salary >= SALARY_ABOVE)  return 'linear-gradient(135deg,#1b5e20,#43a047)';
  if (salary >= SALARY_TARGET) return 'linear-gradient(135deg,#00897b,#26c6da)';
  return 'linear-gradient(135deg,#f57f17,#ffca28)';
}

// ── Bar fill colour based on headcount threshold ──────────────
function getBarColor(count) {
  if (count < DEPT_UNDERSTAFFED) return 'linear-gradient(90deg,#b71c1c,#ef5350)';
  if (count >= DEPT_HEALTHY)     return 'linear-gradient(90deg,#1b5e20,#43a047)';
  return 'linear-gradient(90deg,#1a237e,#4078c0)';
}

// ── Bar chart ─────────────────────────────────────────────────
function BarChart({ title, items, labelKey }) {
  const max = Math.max(...items.map(i => i.count), 1);
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      {items.map(item => (
        <div className="bar-item" key={item[labelKey]}>
          <div className="bar-label">
            <span>{item[labelKey]}</span>
            <span>{item.count}</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{
              '--bar-width': `${(item.count / max) * 100}%`,
              background: getBarColor(item.count),
            }} />
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="empty-hint">No data yet.</p>}
    </div>
  );
}
BarChart.propTypes = {
  title:    PropTypes.string.isRequired,
  items:    PropTypes.arrayOf(PropTypes.shape({ count: PropTypes.number })).isRequired,
  labelKey: PropTypes.string.isRequired,
};

// ── Trend bar chart (for monthly data) ───────────────────────
function TrendChart({ title, items, valueKey, labelKey, formatValue }) {
  const max = Math.max(...items.map(i => i[valueKey]), 1);
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      {items.length === 0 && <p className="empty-hint">No data available for the last 6 months.</p>}
      {items.map(item => (
        <div className="bar-item" key={item[labelKey]}>
          <div className="bar-label">
            <span>{item[labelKey]}</span>
            <span>{formatValue ? formatValue(item[valueKey]) : item[valueKey]}</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{
              '--bar-width': `${(item[valueKey] / max) * 100}%`,
              background: 'linear-gradient(90deg,#1a237e,#4078c0)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
TrendChart.propTypes = {
  title:       PropTypes.string.isRequired,
  items:       PropTypes.array.isRequired,
  valueKey:    PropTypes.string.isRequired,
  labelKey:    PropTypes.string.isRequired,
  formatValue: PropTypes.func,
};

// ── Skeleton loader ───────────────────────────────────────────
// Varied widths give the skeleton a realistic, non-uniform look
const SKELETON_BAR_WIDTHS = [80, 55, 70, 45, 65];

function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="skeleton-block skeleton-icon-block" />
      <div className="skeleton-text-group">
        <div className="skeleton-block skeleton-text-sm" />
        <div className="skeleton-block skeleton-text-lg" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="chart-card">
      <div className="skeleton-block skeleton-chart-title" />
      {SKELETON_BAR_WIDTHS.map((w, i) => (
        <div className="bar-item" key={i}>
          <div className="bar-label">
            <div className="skeleton-block" style={{ height: 10, width: `${w * 0.4}%` }} />
            <div className="skeleton-block" style={{ height: 10, width: 28 }} />
          </div>
          <div className="bar-track">
            <div className="skeleton-block" style={{ height: 8, width: `${w}%`, borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Activity summary card ─────────────────────────────────────
function ActivitySummary({ count }) {
  return (
    <div className="activity-card">
      <span className="activity-icon">🎯</span>
      <div>
        <div className="activity-label">Session Activity</div>
        <div className="activity-value">
          {count === 0
            ? 'No actions yet this session.'
            : count >= 5
              ? `🎉 Great work! You've updated ${count} records today.`
              : `You have updated ${count} record${count !== 1 ? 's' : ''} this session.`}
        </div>
      </div>
    </div>
  );
}
ActivitySummary.propTypes = { count: PropTypes.number.isRequired };

// ── Dashboard page ────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [error, setError] = useState('');
  const [activityCount, setActivityCount] = useState(
    parseInt(sessionStorage.getItem('ems_activity_count') || '0')
  );

  useEffect(() => {
    apiFetch('/api/dashboard/stats')
      .then(setStats)
      .catch(e => setError(e.message));
    apiFetch('/api/dashboard/trends')
      .then(setTrends)
      .catch(() => setTrends({ monthlyTrends: [], departmentTrends: [] }));
  }, []);

  // Keep activity count in sync with sessionStorage updates from Employees page
  useEffect(() => {
    const sync = () => setActivityCount(parseInt(sessionStorage.getItem('ems_activity_count') || '0'));
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  const avgSalary = stats ? Number(stats.avgSalary) : 0;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Welcome back! Here&apos;s your workforce overview.</div>
        {error && <div className="error-msg">{error}</div>}

        <ActivitySummary count={activityCount} />

        {stats ? (
          <>
            <div className="stats-grid">
              <StatCard
                label="Total Employees"
                numericValue={stats.total}
                color="linear-gradient(135deg,#1a237e,#4078c0)"
                ringPercent={Math.min(stats.total / MAX_EMPLOYEES_RING * 100, 100)}
                icon={<svg viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>}
              />
              <StatCard
                label="Avg. Salary"
                numericValue={avgSalary}
                format={v => `$${Math.round(v).toLocaleString()}`}
                color={getSalaryColor(avgSalary)}
                ringPercent={Math.min(avgSalary / MAX_SALARY_RING * 100, 100)}
                icon={<svg viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>}
              />
              <StatCard
                label="Departments"
                numericValue={stats.byDepartment.length}
                color="linear-gradient(135deg,#6a1b9a,#ab47bc)"
                ringPercent={Math.min(stats.byDepartment.length / MAX_DEPT_RING * 100, 100)}
                icon={<svg viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>}
              />
              <StatCard
                label="Roles"
                numericValue={stats.byRole.length}
                color="linear-gradient(135deg,#e65100,#ff7043)"
                ringPercent={Math.min(stats.byRole.length / MAX_DEPT_RING * 100, 100)}
                icon={<svg viewBox="0 0 24 24" fill="#fff" width="24" height="24"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 16.48 1 14.64 1 13.6 1 12.8 1.48 12.2 2.38L12 2.67l-.2-.29C11.2 1.48 10.4 1 9.36 1 7.52 1 6 2.53 6 4.64c0 .48.11.92.18 1.36H4c-1.1 0-1.99.9-1.99 2L2 19c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>}
              />
            </div>
            <div className="charts-row">
              <BarChart title="Employees by Department" items={stats.byDepartment} labelKey="department" />
              <BarChart title="Employees by Role" items={stats.byRole} labelKey="role" />
            </div>
          </>
        ) : !error && (
          <>
            <div className="stats-grid">
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <div className="charts-row">
              <SkeletonChart /><SkeletonChart />
            </div>
          </>
        )}

        <div className="section-title">📊 6-Month Statistics</div>
        {trends ? (
          <div className="charts-row">
            <TrendChart
              title="New Hires per Month"
              items={trends.monthlyTrends}
              valueKey="newHires"
              labelKey="month"
            />
            <TrendChart
              title="Avg. Salary Trend"
              items={trends.monthlyTrends}
              valueKey="avgSalary"
              labelKey="month"
              formatValue={v => `$${Math.round(v).toLocaleString()}`}
            />
          </div>
        ) : !error && (
          <div className="charts-row">
            <SkeletonChart /><SkeletonChart />
          </div>
        )}
      </main>
    </div>
  );
}

