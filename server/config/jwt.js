/**
 * JWT Configuration and Secret Validation Helper
 */

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      'FATAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing or shorter than 32 characters.'
    );
  }
  return secret.trim();
};

export const getJwtExpiresIn = () => {
  return process.env.JWT_EXPIRES_IN || '2h';
};

export default {
  getJwtSecret,
  getJwtExpiresIn
};
