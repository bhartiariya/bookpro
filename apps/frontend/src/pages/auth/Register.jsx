import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/auth.api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-4">
        <h4 className="mb-3">Register</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input className="form-control" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
            </select>
          </div>
          <button className="btn btn-dark w-100" type="submit">Register</button>
        </form>
        <p className="mt-3 text-center small">
          Have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
