const { query } = require('../config/db');
async function audit({ actorId, action, resourceType, resourceId, requestId, metadata = {} }) { await query('INSERT INTO audit_logs(actor_id,action,resource_type,resource_id,request_id,metadata) VALUES($1,$2,$3,$4,$5,$6)', [actorId || null, action, resourceType, resourceId || null, requestId || null, JSON.stringify(metadata)]); }
module.exports = { audit };
