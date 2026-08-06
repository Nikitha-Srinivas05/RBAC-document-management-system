const mongoose = require('mongoose');

// Append-only: every edit inserts a new row here rather than mutating
// an existing one. This gives you version history "for free" and is
// what the audit trail links back to for edit events.
const documentVersionSchema = new mongoose.Schema(
  {
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    versionNumber: { type: Number, required: true },
    content: { type: String, required: true },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Fast lookup of "all versions of this document, in order"
documentVersionSchema.index({ document: 1, versionNumber: -1 });

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);
