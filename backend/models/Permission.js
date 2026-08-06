const mongoose = require('mongoose');

// The join table between User <-> Document <-> Role.
// One row = "this user has this role on this document."
// The compound unique index prevents duplicate grants for the same pair.
const permissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

permissionSchema.index({ user: 1, document: 1 }, { unique: true });
permissionSchema.index({ document: 1 }); // fast "who has access to this doc" lookups

module.exports = mongoose.model('Permission', permissionSchema);
