import { useEffect, useState } from 'react';
import { getMyBookings, cancelBooking } from '../../api/bookings.api';

const STATUS_BADGE = {
  pending:   'warning', confirmed: 'success',
  rejected:  'danger',  cancelled: 'secondary', completed: 'dark',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const res = await getMyBookings();
    setBookings(res.data.data);
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id, {});
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div>
      <h4 className="mb-3">My Bookings</h4>
      {bookings.length === 0 && <p className="text-muted">No bookings yet</p>}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Service</th><th>Provider</th><th>Date</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.service_title}</td>
              <td>{b.provider_name}</td>
              <td>{new Date(b.start_time).toLocaleString()}</td>
              <td>
                <span className={`badge bg-${STATUS_BADGE[b.status]}`}>{b.status}</span>
              </td>
              <td>
                {['pending', 'confirmed'].includes(b.status) &&
                  <button className="btn btn-sm btn-outline-danger"
                    onClick={() => handleCancel(b.id)}>Cancel</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
