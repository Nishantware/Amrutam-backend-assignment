const jwt = require('jsonwebtoken');
const { AppError } = require('./errors');
function authenticate(req, res, next) { const header = req.headers.authorization || ''; const token = header.startsWith('Bearer ') ? header.slice(7) : null; if (!token) return next(new AppError(401, 'Bearer token required', 'UNAUTHENTICATED')); try { req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'amrutam-api', audience: 'amrutam-client' }); next(); } catch { next(new AppError(401, 'Invalid or expired token', 'UNAUTHENTICATED')); } }
function authorize(...roles) { return (req, res, next) => { if (!req.user) return next(new AppError(401, 'Authentication required', 'UNAUTHENTICATED')); if (!roles.includes(req.user.role)) return next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN')); next(); }; }
module.exports = { authenticate, authorize };
