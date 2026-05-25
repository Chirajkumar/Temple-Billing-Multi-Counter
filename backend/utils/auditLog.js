const AuditLog = require('../models/AuditLog');

/**
 * Safe audit-log writer.
 * Never throws to caller (audit logging should not break business flow).
 */
const auditLog = async (req, action, module, details = undefined) => {
  try {
    const userId = req?.user?._id || req?.user?.id;
    if (!userId) return; // can't log without actor

    const ipAddress = req?.ip || req?.connection?.remoteAddress;

    await AuditLog.create({
      user: userId,
      action: String(action),
      module: String(module),
      details: details !== undefined ? String(details) : undefined,
      ipAddress: ipAddress ? String(ipAddress) : undefined
    });
  } catch (err) {
    // Intentionally swallow; write to server console only.
    console.error('AuditLog write error:', err);
  }
};

module.exports = { auditLog };

