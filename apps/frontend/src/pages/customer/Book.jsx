import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getAvailableSlots } from '../../api/slots.api';
import { createBooking } from '../../api/bookings.api';

export default function Book() {
  const { providerId } = useParams();
  const [searchParams]  = useSearchParams();
  const serviceId       = searchParams.get('serviceId');
  const [slots, setSlots]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes]   = useState('');
  const [msg, setMsg]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAvailableSlots(providerId).then(res => setSlots(res.data.data));
  }, [providerId]);

  const handleBook = async () => {
    if (!selected) return setMsg('Please select a slot');
    try {
      await createBooking({ service_id: serviceId, slot_id: selected, notes });
      navigate('/my-bookings');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h4 className="mb-3">Select a Slot</h4>
        {msg && <div className="alert alert-danger">{msg}</div>}

        {slots.length === 0
          ? <p className="text-muted">No available slots</p>
          : slots.map(slot => (
            <div key={slot.id}
              className={`p-3 mb-2 border rounded cursor-pointer ${selected === slot.id ? 'border-dark bg-light' : ''}`}
              onClick={() => setSelected(slot.id)}
              style={{ cursor: 'pointer' }}>
              <strong>{new Date(slot.start_time).toLocaleString()}</strong>
              <span className="text-muted ms-2">→ {new Date(slot.end_time).toLocaleTimeString()}</span>
            </div>
          ))
        }

        <div className="mt-3">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-control" rows={2} value={notes}
            onChange={e => setNotes(e.target.value)} />
        </div>

        <button className="btn btn-dark w-100 mt-3" onClick={handleBook}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
