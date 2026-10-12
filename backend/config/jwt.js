const jwt = require('jsonwebtoken');

/**
 * Trusted JWT Configuration Utility
 * Eliminates insecure hardcoded secret fallbacks.
 * Throws a critical error if JWT_SECRET is not configured in the environment.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  // Generate once with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  // 64 hex characters represent 32 random bytes (256 bits) when generated securely.
  if (!secret || !/^[a-f0-9]{64,}$/i.test(secret.trim()) || secret.trim().length % 2 !== 0) {
    throw new Error('SECURITY CONFIGURATION ERROR: JWT_SECRET must be a randomly generated hex string of at least 64 characters (32 bytes).');
  }
  return secret.trim();
}

function signToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  getJwtSecret,
  signToken,
  verifyToken
};
