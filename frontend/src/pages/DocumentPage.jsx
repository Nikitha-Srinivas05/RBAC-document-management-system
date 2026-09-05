import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client.js';
import DocumentEditor from '../components/DocumentEditor.jsx';
import PermissionsPanel from '../components/PermissionsPanel.jsx';
import AuditTrail from '../components/AuditTrail.jsx';

export default function DocumentPage() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(null); // null | 'saving' | 'saved' | 'forbidden' | 'error'
  const [versions, setVersions] = useState([]);

  const loadDocument = async () => {
    const { data } = await api.get(`/documents/${id}`);
    setDocument(data.document);
    setContent(data.document.currentVersion?.content || '');
  };

  const loadVersions = async () => {
    try {
      const { data } = await api.get(`/documents/${id}/versions`);
      setVersions(data.versions);
    } catch {
      // non-critical, ignore
    }
  };

  useEffect(() => {
    loadDocument();
    loadVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    setStatus('saving');
    try {
      await api.put(`/documents/${id}`, { content });
      setStatus('saved');
      loadDocument();
      loadVersions();
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      setStatus(err.response?.status === 403 ? 'forbidden' : 'error');
    }
  };

  if (!document) return <div className="app-shell"><p>Loading…</p></div>;

  return (
    <div className="app-shell">
      <Link to="/" className="back-link">← Back to Documents</Link>
      <h2>{document.title}</h2>

      <DocumentEditor initialContent={content} onChange={setContent} editable={true} />

      <div className="editor-actions">
        <button onClick={handleSave} disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {status === 'saved' && <span className="status-ok">Saved ✓</span>}
        {status === 'forbidden' && (
          <span className="status-error">You don't have edit access to this document.</span>
        )}
        {status === 'error' && <span className="status-error">Save failed.</span>}
        <span className="version-count">
          {versions.length > 0 ? `v${versions[0].versionNumber}` : ''}
        </span>
      </div>

      <PermissionsPanel documentId={id} />
      <AuditTrail documentId={id} />
    </div>
  );
}
