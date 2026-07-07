import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Users() {
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole]     = useState('');

  const fetchUsers = async () => {
    const res = await api.get('/users', { params: { search, role } });
    setUsers(res.data.data);
  };

  useEffect(() => { fetchUsers(); }, [search, role]);

  const toggleBlock = async (id, blocked) => {
    await api.patch(`/users/block/${id}`);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  return (
    <div>
      <h4 className="mb-3">Users</h4>
      <div className="row g-2 mb-3">
        <div className="col-md-5">
          <input className="form-control" placeholder="Search by name or email"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className="badge bg-secondary">{u.role}</span></td>
              <td><span className={`badge bg-${u.is_blocked ? 'danger' : 'success'}`}>
                {u.is_blocked ? 'Blocked' : 'Active'}</span></td>
              <td className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-dark"
                  onClick={() => toggleBlock(u.id, u.is_blocked)}>
                  {u.is_blocked ? 'Unblock' : 'Block'}
                </button>
                <button className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteUser(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
