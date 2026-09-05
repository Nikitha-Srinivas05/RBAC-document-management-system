import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/documents');
      setDocuments(data.documents);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const { data } = await api.post('/documents', {
      title: newTitle,
      content: '<h1>' + newTitle + '</h1><p>Start writing…</p>',
    });
    navigate(`/documents/${data.document._id}`);
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <h2>My Documents</h2>
        <div>
          <span className="user-chip">{user?.name}</span>
          <button className="link-btn" onClick={logout}>Log Out</button>
        </div>
      </div>

      <form className="new-doc-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New document title…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit">+ Create</button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : documents.length === 0 ? (
        <p className="empty-state">No documents yet — create one above to get started.</p>
      ) : (
        <ul className="doc-list">
          {documents.map((doc) => (
            <li key={doc._id}>
              <Link to={`/documents/${doc._id}`}>
                <span className="doc-title">{doc.title}</span>
                <span className="doc-meta">
                    Version {doc.currentVersion?.versionNumber ?? 1}, updated{' '}
                    {new Date(doc.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
