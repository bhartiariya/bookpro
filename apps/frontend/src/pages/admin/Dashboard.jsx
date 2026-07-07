import { useEffect, useState } from 'react';
import { getOverview, getTopProviders } from '../../api/analytics.api';

export default function Dashboard() {
  const [overview, setOverview]   = useState(null);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    getOverview().then(res => setOverview(res.data.data));
    getTopProviders().then(res => setProviders(res.data.data));
  }, []);

  if (!overview) return <p>Loading...</p>;

  return (
    <div>
      <h4 className="mb-4">Dashboard</h4>

      <div className="row g-3 mb-4">
        {[
          ['Total Users',    overview.total_users],
          ['Total Providers',overview.total_providers],
          ['Total Bookings', overview.bookings.total],
          ['Revenue',        `₹${overview.total_revenue}`],
        ].map(([label, value]) => (
          <div key={label} className="col-md-3">
            <div className="card text-center p-3">
              <h6 className="text-muted">{label}</h6>
              <h3>{value}</h3>
            </div>
          </div>
        ))}
      </div>

      <h5 className="mb-3">Top Providers</h5>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr><th>Name</th><th>Bookings</th><th>Revenue</th><th>Avg Rating</th></tr>
        </thead>
        <tbody>
          {providers.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.total_bookings}</td>
              <td>₹{p.total_revenue}</td>
              <td>{p.avg_rating || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
