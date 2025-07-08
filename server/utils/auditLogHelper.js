// server/utils/auditLogHelper.js
const Audit = require('../models/audit.models');

/**
 * Write a human-friendly audit log for any action.
 * @param {Object} params
 * @param {Object} params.req 
 * @param {String} params.action 
 * @param {String} params.targetType 
 * @param {String|Number} params.targetId )
 * @param {String} params.targetName 
 * @param {Object} [params.before] 
 * @param {Object} [params.after] 
 * @param {String} [params.extra] 
 */
async function writeAuditLog({ req, action, targetType, targetId, targetName, before, after, extra }) {
  if (!req.user) return;
  let details = '';
  const actor = `${req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)} ${req.user.name}`;
  const target = `${targetType.charAt(0).toUpperCase() + targetType.slice(1)}: ${targetName} (ID: ${targetId})`;
  const timestamp = new Date().toLocaleString();

  if (action.toLowerCase().includes('update') && before && after) {
    const changes = [];
    for (const key in after) {
      if (before[key] !== undefined && before[key] !== after[key]) {
        changes.push(`${key}: '${before[key]}' → '${after[key]}'`);
      }
    }
    details = `${actor} updated ${target} on ${timestamp}.\nFields changed: ${changes.join(', ')}`;
  } else if (action.toLowerCase().includes('delete')) {
    details = `${actor} deleted ${target} on ${timestamp}.`;
  } else if (action.toLowerCase().includes('create')) {
    details = `${actor} created ${target} on ${timestamp}.`;
  } else if (action.toLowerCase().includes('status')) {
    let statusChange = '';
    if (before && after && before.status !== undefined && after.status !== undefined && before.status !== after.status) {
      statusChange = `Status: '${before.status}' → '${after.status}'.`;
    }
    details = `${actor} changed status of ${target} on ${timestamp}. ${statusChange}${extra ? '\n' + extra : ''}`;
  } else {
    details = `${actor} performed '${action}' on ${target} on ${timestamp}.${extra ? '\n' + extra : ''}`;
  }
  await Audit.create({
    userId: req.user._id,
    userName: req.user.name,
    role: req.user.role,
    action,
    details
  });
}

module.exports = { writeAuditLog };
