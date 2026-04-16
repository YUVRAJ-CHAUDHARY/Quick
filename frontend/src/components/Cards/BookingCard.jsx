import { useState } from 'react';
import { confirmBooking, cancelBooking, updateBookingStatus, acceptBooking, rejectBooking } from '../../api';

const statusLabel = (s) => s.replace('_', ' ').toUpperCase();

export default function BookingCard({ booking, role, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const act = async (fn, ...args) => {
    setLoading(true);
    try {
      await fn(...args);
      onUpdate?.();
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const { _id, service, client, provider, status, visitCharges, description, clientAddress, createdAt } = booking;

  return (
    <div className="booking-card">
      <div className="booking-card-header">
        <div>
          <div className="booking-card-title">
            {service?.icon} {service?.name}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            #{_id?.slice(-8).toUpperCase()} · {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <span className={`badge badge-${status}`}>{statusLabel(status)}</span>
      </div>

      <div className="booking-card-body">
        {description && <div>📝 {description}</div>}
        {clientAddress && <div>📍 {clientAddress}</div>}
        {role !== 'client' && client && (
          <div>👤 {client.name} · 📞 {client.phone}</div>
        )}
        {role !== 'provider' && provider && (
          <div>🔧 Provider: {provider.name} · ⭐ {provider.rating || 'N/A'}</div>
        )}
        {visitCharges > 0 && (
          <div style={{ color: 'var(--gold)', fontWeight: 600, marginTop: '0.4rem' }}>
            💰 Visit Charges: ₹{visitCharges}
          </div>
        )}
      </div>

      {/* Action buttons per role and status */}
      <div className="booking-card-footer">
        <div />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>

          {/* CLIENT: confirm after provider accepts */}
          {role === 'client' && status === 'accepted' && (
            <>
              <button
                className="btn btn-gold btn-sm"
                disabled={loading}
                onClick={() => act(confirmBooking, _id)}
              >
                ✅ Confirm & Pay ₹{visitCharges}
              </button>
              <button
                className="btn btn-danger btn-sm"
                disabled={loading}
                onClick={() => act(cancelBooking, _id)}
              >
                Cancel
              </button>
            </>
          )}

          {/* CLIENT: cancel pending */}
          {role === 'client' && status === 'pending' && (
            <button className="btn btn-danger btn-sm" disabled={loading} onClick={() => act(cancelBooking, _id)}>
              Cancel Request
            </button>
          )}

          {/* PROVIDER: accept/reject pending */}
          {role === 'provider' && status === 'pending' && (
            <>
              <button className="btn btn-success btn-sm" disabled={loading} onClick={() => act(acceptBooking, _id)}>
                ✓ Accept
              </button>
              <button className="btn btn-danger btn-sm" disabled={loading} onClick={() => act(rejectBooking, _id)}>
                ✗ Reject
              </button>
            </>
          )}

          {/* PROVIDER: start job */}
          {role === 'provider' && status === 'confirmed' && (
            <button className="btn btn-gold btn-sm" disabled={loading} onClick={() => act(updateBookingStatus, _id, 'in_progress')}>
              🚀 Start Job
            </button>
          )}

          {/* PROVIDER: complete job */}
          {role === 'provider' && status === 'in_progress' && (
            <button className="btn btn-success btn-sm" disabled={loading} onClick={() => act(updateBookingStatus, _id, 'completed')}>
              ✅ Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}