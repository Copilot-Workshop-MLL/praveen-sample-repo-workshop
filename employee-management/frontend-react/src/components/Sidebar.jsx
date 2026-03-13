import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../auth';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>EMS Portal</h2>
        <p>Employee Management</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
          Dashboard
        </NavLink>
        <NavLink to="/employees" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
          Employees
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">{user.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <p>{user}</p>
            <span>Administrator</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </div>
    </aside>
  );
}
