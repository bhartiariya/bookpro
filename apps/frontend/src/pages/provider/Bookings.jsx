import { useEffect, useState } from 'react';
import { getProviderBookings, confirmBooking, rejectBooking, completeBooking } from '../../api/bookings.api';

const STATUS_BADGE = {
  pending: 'warning', confirmed: 'success',
  rejected: 'danger', cancelled: 'secondary', completed: 'dark',
};

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    const res = await getProviderBookings();
    setBookings(res.data.data);
  };

  useEffect(() => { fetchBookings(); }, []);

  const handle = async (action, id) => {
    try {
      if (action === 'confirm')  await confirmBooking(id);
      if (action === 'reject')   await rejectBooking(id);
      if (action === 'complete') await completeBooking(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div>
      <h4 className="mb-3">Incoming Bookings</h4>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr><th>Customer</th><th>Service</th><th>Date</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.customer_name}</td>
              <td>{b.service_title}</td>
              <td>{new Date(b.start_time).toLocaleString()}</td>
              <td><span className={`badge bg-${STATUS_BADGE[b.status]}`}>{b.status}</span></td>
              <td className="d-flex gap-1">
                {b.status === 'pending' && <>
                  <button className="btn btn-sm btn-success" onClick={() => handle('confirm', b.id)}>Confirm</button>
                  <button className="btn btn-sm btn-danger"  onClick={() => handle('reject', b.id)}>Reject</button>
                </>}
                {b.status === 'confirmed' &&
                  <button className="btn btn-sm btn-dark" onClick={() => handle('complete', b.id)}>Complete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
