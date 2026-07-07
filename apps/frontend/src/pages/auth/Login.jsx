import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(form);
      const { token, user } = res.data.data;
      setAuth(user, token);
      if (user.role === 'admin')    return navigate('/admin/dashboard');
      if (user.role === 'provider') return navigate('/provider/services');
      navigate('/services');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-4">
        <h4 className="mb-3">Login</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
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
          <button className="btn btn-dark w-100" type="submit">Login</button>
        </form>
        <p className="mt-3 text-center small">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
