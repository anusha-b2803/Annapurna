const AuditLog = require('../models/AuditLog');

const logAction = async (action, req, details = {}, resourceType = null, resourceId = null) => {
  try {
    await AuditLog.create({
      action,
      user: req.user?._id,
      details,
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      resourceType,
      resourceId
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

module.exports = { logAction };
