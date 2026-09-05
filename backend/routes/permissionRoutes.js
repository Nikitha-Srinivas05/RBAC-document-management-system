const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const requireDocumentPermission = require('../middleware/permissionMiddleware');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');

const router = express.Router();
router.use(requireAuth);

router.post('/:id', requireDocumentPermission('canManagePermissions'), async (req, res) => {
  try {
    const { userEmail, roleName } = req.body;
    if (!userEmail || !roleName) {
      return res.status(400).json({ error: 'userEmail and roleName are required' });
    }

    const targetUser = await User.findOne({ email: userEmail.toLowerCase() });
    if (!targetUser) return res.status(404).json({ error: 'No user found with that email' });

    const role = await Role.findOne({ name: roleName.toLowerCase() });
    if (!role) return res.status(400).json({ error: 'Invalid role name (use owner, editor, or viewer)' });

    const permission = await Permission.findOneAndUpdate(
      { user: targetUser._id, document: req.params.id },
      { role: role._id, grantedBy: req.user.id },
      { upsert: true, new: true }
    )
      .populate('role', 'name')
      .populate('user', 'name email');

    await AuditLog.create({
      actor: req.user.id,
      action: 'PERMISSION_GRANT',
      document: req.params.id,
      metadata: { targetUser: targetUser.email, role: role.name },
    });

    res.json({ permission });
  } catch (err) {
    res.status(500).json({ error: 'Failed to grant permission', details: err.message });
  }
});

router.get('/:id', requireDocumentPermission('canManagePermissions'), async (req, res) => {
  try {
    const permissions = await Permission.find({ document: req.params.id })
      .populate('user', 'name email')
      .populate('role', 'name');

    res.json({ permissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list permissions', details: err.message });
  }
});

router.delete('/:id/:userId', requireDocumentPermission('canManagePermissions'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document not found' });

    if (document.owner.toString() === req.params.userId) {
      return res.status(400).json({ error: "Cannot revoke the document owner's access" });
    }

    const removed = await Permission.findOneAndDelete({ user: req.params.userId, document: req.params.id });
    if (!removed) return res.status(404).json({ error: 'That user does not have access to this document' });

    await AuditLog.create({
      actor: req.user.id,
      action: 'PERMISSION_REVOKE',
      document: req.params.id,
      metadata: { targetUser: req.params.userId },
    });

    res.json({ message: 'Access revoked' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke permission', details: err.message });
  }
});

module.exports = router;