import { useState } from 'react';
import DocumentEditor from '../components/DocumentEditor.jsx';
import api from '../api/client.js';

export default function DocumentEditorPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(null);

  const handleSave = async () => {
    try {
      setStatus('saving');
      // NOTE: /api/documents doesn't exist yet - this is the Day 2 route.
      // Wiring it here now so the editor page is ready to go the moment
      // that endpoint is built.
      await api.post('/documents', { title, content });
      setStatus('saved');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="app-shell">
      <h2>New Document</h2>
      <input
        type="text"
        placeholder="Document title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: 15,
          marginBottom: 16,
          border: '1px solid #d8dae0',
          borderRadius: 6,
        }}
      />

      <DocumentEditor onChange={setContent} />

      <button
        onClick={handleSave}
        style={{
          marginTop: 16,
          padding: '10px 18px',
          background: '#2f5eff',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        Save Document
      </button>

      {status === 'saving' && <p>Saving…</p>}
      {status === 'saved' && <p>Saved ✅</p>}
      {status === 'error' && <p>Save failed — check the backend is running.</p>}
    </div>
  );
}
