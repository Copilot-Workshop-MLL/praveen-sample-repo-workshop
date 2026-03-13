import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import EmployeeModal from '../components/EmployeeModal';
import { apiFetch } from '../auth';

// ── Session activity tracking ─────────────────────────────────
const ACTIVITY_KEY = 'ems_activity_count';
function getActivityCount() { return parseInt(sessionStorage.getItem(ACTIVITY_KEY) || '0'); }
function incrementActivity() {
  const next = getActivityCount() + 1;
  sessionStorage.setItem(ACTIVITY_KEY, next);
  return next;
}

// ── Milestone badge helpers ───────────────────────────────────

function getMilestoneBadges(emp, allEmployees) {
  const badges = [];
  const today = new Date();
  const hire = new Date(emp.hireDate);
  const daysEmployed = (today - hire) / (24 * 60 * 60 * 1000);
  const yearsEmployed = daysEmployed / 365.25;

  // 🆕 New Joiner: hired within the last 30 days
  if (daysEmployed < 30) {
    badges.push({ emoji: '🆕', title: 'New Joiner (hired within last 30 days)' });
  }

  // 🎂 Work Anniversary: 1, 3, or 5 years (shown during that anniversary year)
  const floorYears = Math.floor(yearsEmployed);
  if (floorYears === 1 || floorYears === 3 || (floorYears >= 5 && floorYears % 5 === 0)) {
    badges.push({ emoji: '🎂', title: `${floorYears}-Year Work Anniversary!` });
  }

  // 💰 Top Earner: salary in the top 10% of the team
  if (allEmployees.length > 1) {
    const sorted = [...allEmployees].map(e => Number(e.salary)).sort((a, b) => a - b);
    const threshold = sorted[Math.floor(sorted.length * 0.9)];
    if (Number(emp.salary) >= threshold) {
      badges.push({ emoji: '💰', title: 'Top Earner (top 10% salary)' });
    }
  }

  return badges;
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [error, setError] = useState('');
  const [modalEmployee, setModalEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activityCount, setActivityCount] = useState(getActivityCount());

  const load = useCallback(async () => {
    setError('');
    try {
      let url = '/api/employees?';
      if (filterDept) url += `department=${encodeURIComponent(filterDept)}&`;
      if (filterRole) url += `role=${encodeURIComponent(filterRole)}`;
      const data = await apiFetch(url);
      setEmployees(data);
    } catch (e) {
      setError(e.message);
    }
  }, [filterDept, filterRole]);

  useEffect(() => { load(); }, [load]);

  const trackAction = () => setActivityCount(incrementActivity());

  const openAdd = () => { setModalEmployee(null); setShowModal(true); };
  const openEdit = (emp) => { setModalEmployee(emp); setShowModal(true); };
  const closeModal = () => setShowModal(false);
  const onSaved = () => { closeModal(); load(); trackAction(); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await apiFetch(`/api/employees/${id}`, { method: 'DELETE' });
      trackAction();
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <div>
            <div className="page-title">Employees</div>
            <div className="page-sub">Manage your workforce</div>
          </div>
          <button className="btn-primary" onClick={openAdd}>+ Add Employee</button>
        </div>

        {activityCount >= 5 && (
          <div className="activity-congrats">
            🎉 Great work! You&apos;ve updated {activityCount} records this session.
          </div>
        )}

        <div className="filters">
          <input value={filterDept} onChange={e => setFilterDept(e.target.value)} placeholder="🔍 Filter by department" />
          <input value={filterRole} onChange={e => setFilterRole(e.target.value)} placeholder="🔍 Filter by role" />
          <button className="btn-primary" onClick={load}>Search</button>
          <button className="btn-secondary" onClick={() => { setFilterDept(''); setFilterRole(''); }}>Clear</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Email</th><th>Department</th>
                <th>Role</th><th>Hire Date</th><th>Salary</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="8" className="empty-state">No employees found.</td></tr>
              ) : employees.map(e => {
                const badges = getMilestoneBadges(e, employees);
                return (
                  <tr key={e.id}>
                    <td>#{e.id}</td>
                    <td>
                      <strong>{e.name}</strong>
                      {badges.map(b => (
                        <span key={b.emoji} className="milestone-badge" title={b.title}>{b.emoji}</span>
                      ))}
                    </td>
                    <td>{e.email}</td>
                    <td><span className="badge badge-dept">{e.department}</span></td>
                    <td><span className="badge badge-role">{e.role}</span></td>
                    <td>{e.hireDate}</td>
                    <td>${Number(e.salary).toLocaleString()}</td>
                    <td>
                      <button className="btn-edit" onClick={() => openEdit(e)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(e.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && <EmployeeModal employee={modalEmployee} onClose={closeModal} onSaved={onSaved} />}
    </div>
  );
}
