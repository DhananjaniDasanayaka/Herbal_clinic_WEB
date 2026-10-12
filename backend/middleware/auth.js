const { verifyToken } = require('../config/jwt');

/**
 * JWT Authentication Middleware
 * Validates the Authorization: Bearer <token> header and extracts the user ID.
 * Strictly prevents unauthenticated access and ensures user ID ownership.
 * Uses trusted environment JWT_SECRET without hardcoded fallbacks.
 */
module.exports = function authMiddleware(req, res, next) {
  try {
    let authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization denied. No token provided.' });
    }

    let token = authHeader;
    if (token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    if (!token) {
      return res.status(401).json({ message: 'Authorization denied. Token is missing.' });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.message && err.message.includes('SECURITY CONFIGURATION ERROR')) {
        console.error('CRITICAL AUTH ERROR:', err.message);
        return res.status(500).json({ message: 'Authentication service configuration error.' });
      }
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ message: 'Invalid or malformed token.' });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Token verification failed. Invalid payload.' });
    }

    // Attach user ID directly from the cryptographically verified token
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Unexpected auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};
