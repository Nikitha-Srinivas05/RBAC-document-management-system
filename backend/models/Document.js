const mongoose = require('mongoose');

// The Document itself is lightweight metadata. Actual content lives in
// DocumentVersion so every edit creates a new version instead of
// overwriting history.
const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currentVersion: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentVersion', default: null },
    isDeleted: { type: Boolean, default: false }, // soft delete keeps audit history meaningful
  },
  { timestamps: true }
);

documentSchema.index({ owner: 1 });

module.exports = mongoose.model('Document', documentSchema);
