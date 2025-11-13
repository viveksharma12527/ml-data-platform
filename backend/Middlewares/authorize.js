const authorize = (allowedRoles) => {
    return (req, res, next) => {
        // req.user should be set by your auth middleware
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Insufficient permissions',
                message: `This action requires roles: ${allowedRoles.join(', ')}` 
            });
        }

        next();
    };
};

module.exports = authorize;