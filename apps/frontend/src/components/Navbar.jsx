import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/">BookPro</Link>
      <div className="d-flex gap-3 align-items-center">
        {user && <span className="text-secondary small">{user.name} · {user.role}</span>}
        {user
          ? <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>Logout</button>
          : <Link className="btn btn-sm btn-outline-light" to="/login">Login</Link>
        }
      </div>
    </nav>
  );
}
