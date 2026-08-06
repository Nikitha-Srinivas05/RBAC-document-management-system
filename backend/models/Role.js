const mongoose = require('mongoose');

// Roles are seeded once (see config/seedRoles.js) and referenced by name.
// Keeping the permission set on the Role itself (instead of hardcoding
// checks per-role in code) means adding a new role later is a data change,
// not a code change.
const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. 'owner', 'editor', 'viewer'
    canView: { type: Boolean, default: true },
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canManagePermissions: { type: Boolean, default: false }, // grant/revoke access
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
