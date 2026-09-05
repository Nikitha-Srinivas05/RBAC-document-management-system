const Permission = require('../models/Permission');

/**
 * requireDocumentPermission(action, paramName)
 *
 * Reusable middleware factory. Checks whether req.user has the given
 * permission (e.g. 'canEdit') on the document identified by
 * req.params[paramName], via the Permission -> Role chain.
 *
 * Usage: router.put('/:id', requireDocumentPermission('canEdit'), handler)
 */
function requireDocumentPermission(action, paramName = 'id') {
  return async (req, res, next) => {
    try {
      const documentId = req.params[paramName];
      const permission = await Permission.findOne({ user: req.user.id, document: documentId }).populate('role');

      if (!permission || !permission.role[action]) {
        return res.status(403).json({
          error: `You do not have ${action.replace('can', '').toLowerCase()} access to this document`,
        });
      }

      req.userRole = permission.role;
      next();
    } catch (err) {
      res.status(500).json({ error: 'Permission check failed', details: err.message });
    }
  };
}

module.exports = requireDocumentPermission;