import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { getMySlots, createSlot, deleteSlot } from '../../api/slots.api';
import { getMyServices } from '../../api/services.api';

export default function ProviderSlots() {
  const { user } = useAuthStore();
  const [slots, setSlots]       = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm]         = useState({ service_id: '', start_time: '', end_time: '' });

  const fetchSlots = async () => {
    const res = await getMySlots(user.id);
    setSlots(res.data.data);
  };

  useEffect(() => {
    fetchSlots();
    getMyServices().then(res => setServices(res.data.data));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createSlot(form);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSlot(id);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div>
      <h4 className="mb-3">Manage Slots</h4>

      <form className="border p-3 rounded mb-4" onSubmit={handleCreate}>
        <div className="row g-2">
          <div className="col-md-4">
            <select className="form-select" required value={form.service_id}
              onChange={e => setForm({ ...form, service_id: e.target.value })}>
              <option value="">Select service</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <input className="form-control" type="datetime-local" required
              value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
          </div>
          <div className="col-md-3">
            <input className="form-control" type="datetime-local" required
              value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-dark w-100" type="submit">Add Slot</button>
          </div>
        </div>
      </form>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr><th>Service</th><th>Start</th><th>End</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {slots.map(s => (
            <tr key={s.id}>
              <td>{s.service_title}</td>
              <td>{new Date(s.start_time).toLocaleString()}</td>
              <td>{new Date(s.end_time).toLocaleTimeString()}</td>
              <td><span className={`badge bg-${s.is_booked ? 'danger' : 'success'}`}>
                {s.is_booked ? 'Booked' : 'Free'}</span></td>
              <td>
                {!s.is_booked &&
                  <button className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(s.id)}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
