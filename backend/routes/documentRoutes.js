const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middleware/authMiddleware');
const requireDocumentPermission = require('../middleware/permissionMiddleware');
const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

const router = express.Router();
router.use(requireAuth);

router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { title, content } = req.body;
    if (!title || content === undefined) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    const ownerRole = await Role.findOne({ name: 'owner' });
    if (!ownerRole) {
      return res.status(500).json({ error: 'Owner role not seeded - check server startup' });
    }

    let document;
    await session.withTransaction(async () => {
      document = await Document.create([{ title, owner: req.user.id }], { session });
      document = document[0];

      const version = await DocumentVersion.create(
        [{ document: document._id, versionNumber: 1, content, editedBy: req.user.id }],
        { session }
      );

      document.currentVersion = version[0]._id;
      await document.save({ session });

      await Permission.create(
        [{ user: req.user.id, document: document._id, role: ownerRole._id, grantedBy: req.user.id }],
        { session }
      );

      await AuditLog.create(
        [{ actor: req.user.id, action: 'CREATE', document: document._id, metadata: { versionNumber: 1 } }],
        { session }
      );
    });

    res.status(201).json({ document });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create document', details: err.message });
  } finally {
    session.endSession();
  }
});

router.get('/', async (req, res) => {
  try {
    const permissions = await Permission.find({ user: req.user.id }).select('document role');
    const documentIds = permissions.map((p) => p.document);
    const documents = await Document.find({ _id: { $in: documentIds }, isDeleted: false })
      .populate('currentVersion', 'versionNumber updatedAt')
      .sort({ updatedAt: -1 });

    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list documents', details: err.message });
  }
});

router.get('/:id', requireDocumentPermission('canView'), async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, isDeleted: false }).populate('currentVersion');
    if (!document) return res.status(404).json({ error: 'Document not found' });

    await AuditLog.create({
      actor: req.user.id,
      action: 'VIEW',
      document: document._id,
      metadata: { versionNumber: document.currentVersion?.versionNumber },
    });

    res.json({ document });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch document', details: err.message });
  }
});

router.put('/:id', requireDocumentPermission('canEdit'), async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { content } = req.body;
    if (content === undefined) {
      return res.status(400).json({ error: 'content is required' });
    }

    const document = await Document.findOne({ _id: req.params.id, isDeleted: false });
    if (!document) return res.status(404).json({ error: 'Document not found' });

    const latestVersion = await DocumentVersion.findOne({ document: document._id }).sort({ versionNumber: -1 });
    const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;

    let newVersion;
    await session.withTransaction(async () => {
      newVersion = await DocumentVersion.create(
        [{ document: document._id, versionNumber: nextVersionNumber, content, editedBy: req.user.id }],
        { session }
      );
      newVersion = newVersion[0];

      document.currentVersion = newVersion._id;
      await document.save({ session });

      await AuditLog.create(
        [{ actor: req.user.id, action: 'EDIT', document: document._id, metadata: { versionNumber: nextVersionNumber } }],
        { session }
      );
    });

    res.json({ document, newVersion });
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit document', details: err.message });
  } finally {
    session.endSession();
  }
});

router.get('/:id/versions', requireDocumentPermission('canView'), async (req, res) => {
  try {
    const versions = await DocumentVersion.find({ document: req.params.id })
      .populate('editedBy', 'name email')
      .sort({ versionNumber: -1 });

    res.json({ versions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch version history', details: err.message });
  }
});

router.delete('/:id', requireDocumentPermission('canDelete'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document not found' });

    document.isDeleted = true;
    await document.save();

    await AuditLog.create({ actor: req.user.id, action: 'DELETE', document: document._id });

    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete document', details: err.message });
  }
});

module.exports = router;