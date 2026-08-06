const mongoose = require('mongoose');

// Every meaningful action writes one of these. Designed to be queried
// two ways: "everything that happened to this document" and
// "everything this user has done" - hence the two indexes below.
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      required: true,
      enum: ['VIEW', 'EDIT', 'DELETE', 'PERMISSION_GRANT', 'PERMISSION_REVOKE', 'CREATE'],
    },
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    // Free-form extra context, e.g. { versionNumber: 3 } for EDIT,
    // or { targetUser, role } for PERMISSION_GRANT
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ document: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
