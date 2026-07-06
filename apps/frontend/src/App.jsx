import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer
import Services    from './pages/customer/Services';
import Book        from './pages/customer/Book';
import MyBookings  from './pages/customer/MyBookings';

// Provider
import ProviderServices from './pages/provider/Services';
import ProviderSlots    from './pages/provider/Slots';
import ProviderBookings from './pages/provider/Bookings';

// Admin
import Dashboard from './pages/admin/Dashboard';
import Users     from './pages/admin/Users';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/"        element={<Navigate to="/services" />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer */}
          <Route path="/services"    element={<Services />} />
          <Route path="/book/:providerId" element={
            <ProtectedRoute role="customer"><Book /></ProtectedRoute>} />
          <Route path="/my-bookings" element={
            <ProtectedRoute role="customer"><MyBookings /></ProtectedRoute>} />

          {/* Provider */}
          <Route path="/provider/services" element={
            <ProtectedRoute role="provider"><ProviderServices /></ProtectedRoute>} />
          <Route path="/provider/slots" element={
            <ProtectedRoute role="provider"><ProviderSlots /></ProtectedRoute>} />
          <Route path="/provider/bookings" element={
            <ProtectedRoute role="provider"><ProviderBookings /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={
            <ProtectedRoute role="admin"><Users /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
