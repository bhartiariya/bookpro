import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices } from '../../api/services.api';
import useAuthStore from '../../store/authStore';

export default function Services() {
  const [services, setServices] = useState([]);
  const [search, setSearch]     = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fetchServices = async () => {
    try {
      const res = await getServices({ search });
      setServices(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchServices(); }, [search]);

  return (
    <div>
      <h4 className="mb-3">Browse Services</h4>
      <input className="form-control mb-4" placeholder="Search services..."
        value={search} onChange={e => setSearch(e.target.value)} />

      <div className="row g-3">
        {services.map(s => (
          <div key={s.id} className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title">{s.title}</h6>
                <p className="text-muted small mb-1">{s.provider_name}</p>
                <p className="small">{s.description}</p>
                <p className="fw-bold">₹{s.price} · {s.duration_mins} mins</p>
              </div>
              <div className="card-footer bg-white border-0">
                {user?.role === 'customer'
                  ? <button className="btn btn-dark btn-sm w-100"
                      onClick={() => navigate(`/book/${s.provider_id}?serviceId=${s.id}`)}>
                      Book
                    </button>
                  : <button className="btn btn-outline-dark btn-sm w-100"
                      onClick={() => navigate('/login')}>
                      Login to book
                    </button>
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
