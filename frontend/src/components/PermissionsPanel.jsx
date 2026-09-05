import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function PermissionsPanel({ documentId }) {
  const [permissions, setPermissions] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(true);

  const loadPermissions = async () => {
    try {
      const { data } = await api.get(`/permissions/${documentId}`);
      setPermissions(data.permissions);
      setIsOwner(true);
    } catch (err) {
      // A 403 here just means "you're not the Owner" - not an error to
      // show, just hide the whole panel for this user.
      setIsOwner(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const handleGrant = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/permissions/${documentId}`, { userEmail: email, roleName: role });
      setEmail('');
      loadPermissions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to grant access');
    }
  };

  const handleRevoke = async (userId) => {
    try {
      await api.delete(`/permissions/${documentId}/${userId}`);
      loadPermissions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to revoke access');
    }
  };

  if (loading || !isOwner) return null;

  return (
    <div className="panel">
      <h3>Sharing & Access</h3>
      {error && <p className="error-text">{error}</p>}

      <form className="grant-form" onSubmit={handleGrant}>
        <input
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <button type="submit">Grant Access</button>
      </form>

      <ul className="permission-list">
        {permissions.map((p) => (
          <li key={p._id}>
            <span>{p.user.name} ({p.user.email})</span>
            <span className={`role-badge role-${p.role.name}`}>{p.role.name}</span>
            {p.role.name !== 'owner' && (
              <button className="link-btn danger" onClick={() => handleRevoke(p.user._id)}>
                Revoke
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
