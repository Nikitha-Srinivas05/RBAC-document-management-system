const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const requireDocumentPermission = require('../middleware/permissionMiddleware');
const AuditLog = require('../models/AuditLog');

const router = express.Router();
router.use(requireAuth);

// GET full audit history for a single document.
// Restricted to canManagePermissions (the Owner) - audit trails reveal who
// else has access and what they did, so this is Owner-only, not just
// "anyone who can view the document."
router.get('/document/:id', requireDocumentPermission('canManagePermissions'), async (req, res) => {
  try {
    const logs = await AuditLog.find({ document: req.params.id })
      .populate('actor', 'name email')
      .sort({ createdAt: -1 });

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit trail', details: err.message });
  }
});

// GET everything the CURRENT user has done, across all documents they've touched.
router.get('/me', async (req, res) => {
  try {
    const logs = await AuditLog.find({ actor: req.user.id })
      .populate('document', 'title')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your activity', details: err.message });
  }
});

module.exports = router;