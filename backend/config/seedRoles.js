const Role = require('../models/Role');

const DEFAULT_ROLES = [
  { name: 'owner', canView: true, canEdit: true, canDelete: true, canManagePermissions: true },
  { name: 'editor', canView: true, canEdit: true, canDelete: false, canManagePermissions: false },
  { name: 'viewer', canView: true, canEdit: false, canDelete: false, canManagePermissions: false },
];

async function seedRoles() {
  for (const roleData of DEFAULT_ROLES) {
    await Role.findOneAndUpdate(
      { name: roleData.name },
      roleData,
      { upsert: true, new: true }
    );
  }
  console.log('Roles seeded: owner, editor, viewer');
}

module.exports = seedRoles;
