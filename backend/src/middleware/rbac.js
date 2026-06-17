// Author: Namami | Module: Middleware | CRM Platform v1.0

/**
 * Role-Based Access Control (RBAC) Middleware
 * Usage:
 *   requireRole('ADMIN')
 *   requireAnyRole(['ADMIN', 'SALES_MANAGER'])
 */

/**
 * Require a specific single role
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED',
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${role}`,
        code: 'INSUFFICIENT_ROLE',
      });
    }

    next();
  };
};

/**
 * Require any one of the specified roles
 */
export const requireAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${roles.join(', ')}`,
        code: 'INSUFFICIENT_ROLE',
      });
    }

    next();
  };
};

/**
 * Check if user owns the resource or has elevated role
 * Useful for "own only" restrictions for SALES_EXECUTIVE
 */
export const requireOwnerOrRole = (ownerField, roles = ['ADMIN', 'SALES_MANAGER']) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED',
      });
    }

    // Elevated roles always pass
    if (roles.includes(req.user.role)) {
      return next();
    }

    // For regular users, check ownership (resolved later in controller)
    req.checkOwnership = true;
    req.ownerField = ownerField;
    next();
  };
};

export default { requireRole, requireAnyRole, requireOwnerOrRole };
