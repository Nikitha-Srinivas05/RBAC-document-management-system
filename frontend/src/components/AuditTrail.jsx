import { useEffect, useState } from 'react';
import api from '../api/client.js';

const ACTION_LABELS = {
  CREATE: 'created the document',
  VIEW: 'viewed the document',
  EDIT: 'edited the document',
  DELETE: 'deleted the document',
  PERMISSION_GRANT: 'granted access',
  PERMISSION_REVOKE: 'revoked access',
};

export default function AuditTrail({ documentId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    api
      .get(`/audit/document/${documentId}`)
      .then(({ data }) => setLogs(data.logs))
      .catch((err) => {
        if (err.response?.status === 403) {
          setLogs('forbidden');
        } else {
          setLogs([]);
        }
      })
      .finally(() => setLoading(false));
  }, [documentId, visible]);

  if (!visible) {
    return (
      <button className="link-btn" onClick={() => setVisible(true)}>
        Show Activity Log
      </button>
    );
  }

  return (
    <div className="panel">
      <h3>Activity Log</h3>
      {loading ? (
        <p>Loading…</p>
      ) : logs === 'forbidden' ? (
        <p className="empty-state">Only the document Owner can view the activity log.</p>
      ) : logs.length === 0 ? (
        <p className="empty-state">No activity recorded yet.</p>
      ) : (
        <ul className="audit-list">
          {logs.map((log) => (
            <li key={log._id}>
              <span className="audit-actor">{log.actor?.name ?? 'Unknown user'}</span>{' '}
              <span className="audit-action">{ACTION_LABELS[log.action] || log.action}</span>
              {log.metadata?.versionNumber && (
                <span className="audit-meta"> (v{log.metadata.versionNumber})</span>
              )}
              {log.metadata?.targetUser && (
                <span className="audit-meta"> — {log.metadata.targetUser} ({log.metadata.role})</span>
              )}
              <div className="audit-time">{new Date(log.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
