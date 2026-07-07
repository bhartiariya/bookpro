import { useEffect, useState } from 'react';
import { getMyServices, createService, deleteService } from '../../api/services.api';

export default function ProviderServices() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ title: '', price: '', duration_mins: '', category: '' });
  const [show, setShow] = useState(false);

  const fetchServices = async () => {
    const res = await getMyServices();
    setServices(res.data.data);
  };

  useEffect(() => { fetchServices(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createService(form);
      setForm({ title: '', price: '', duration_mins: '', category: '' });
      setShow(false);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await deleteService(id);
    fetchServices();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>My Services</h4>
        <button className="btn btn-dark btn-sm" onClick={() => setShow(!show)}>
          {show ? 'Cancel' : '+ Add Service'}
        </button>
      </div>

      {show && (
        <form className="border p-3 rounded mb-4" onSubmit={handleCreate}>
          <div className="row g-2">
            <div className="col-md-6">
              <input className="form-control" placeholder="Title" required
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Price" type="number" required
                value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Duration (mins)" type="number" required
                value={form.duration_mins} onChange={e => setForm({ ...form, duration_mins: e.target.value })} />
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="Category (optional)"
                value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="col-12">
              <button className="btn btn-dark btn-sm" type="submit">Create</button>
            </div>
          </div>
        </form>
      )}

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr><th>Title</th><th>Price</th><th>Duration</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s.id}>
              <td>{s.title}</td>
              <td>₹{s.price}</td>
              <td>{s.duration_mins} mins</td>
              <td><span className={`badge bg-${s.is_active ? 'success' : 'secondary'}`}>
                {s.is_active ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
