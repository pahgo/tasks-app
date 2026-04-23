import { useState } from 'react';
import { fetchProfileByEmail } from '../services/profile.service';
import { shareTask } from '../services/tasks.service';

export default function ShareModal({ task, onClose, onShared }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleShare = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const profile = await fetchProfileByEmail(email.trim().toLowerCase());
      if (!profile) {
        throw new Error('No user found with that email');
      }
      await shareTask(task.id, profile.id, role);
      setMessage(`Shared with ${profile.email} as ${role}.`);
      setEmail('');
      onShared?.();
    } catch (shareError) {
      setError(shareError.message || 'Unable to share task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 16px 40px rgba(0,0,0,0.15)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Share task</h3>
            <p style={{ margin: '0.5rem 0 0', color: '#555' }}>Grant access to another user by email.</p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
            ×
          </button>
        </header>
        <form onSubmit={handleShare}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="user@example.com"
            style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #ccc', marginBottom: '1rem' }}
          />
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Permission</label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #ccc', marginBottom: '1rem' }}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.75rem 1rem', cursor: 'pointer', background: '#f5f5f5' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: '0.75rem 1rem', cursor: 'pointer' }}>
              {loading ? 'Sharing…' : 'Share task'}
            </button>
          </div>
          {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
          {error && <p style={{ color: 'var(--error)', marginTop: '1rem' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
