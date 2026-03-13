import { useState, useEffect } from 'react';
import { apiFetch } from '../auth';

const EMPTY = { name: '', email: '', department: '', role: '', hireDate: '', salary: '' };

export default function EmployeeModal({ employee, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(employee ? { ...employee } : EMPTY);
    setError('');
  }, [employee]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const isEdit = !!form.id;
      await apiFetch(isEdit ? `/api/employees/${form.id}` : '/api/employees', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form, salary: Number(form.salary) }),
      });
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2>{form.id ? 'Edit Employee' : 'Add Employee'}</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input name="department" value={form.department} onChange={handleChange} placeholder="Engineering" required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input name="role" value={form.role} onChange={handleChange} placeholder="Developer" required />
            </div>
            <div className="form-group">
              <label>Hire Date</label>
              <input name="hireDate" type="date" value={form.hireDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Salary ($)</label>
              <input name="salary" type="number" value={form.salary} onChange={handleChange} placeholder="60000" min="0" required />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Employee'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
