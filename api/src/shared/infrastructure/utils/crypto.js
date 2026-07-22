import crypto from 'node:crypto';

/**
 * Generates a SHA-256 hash of the data
 *
 * @param {string} data
 * @param {Object} [options]
 * @param {string} [options.salt]
 * @returns {string|null}
 */
export function generateHash(data, { salt } = {}) {
  if (!data) return null;

  const hash = crypto.createHash('sha256');

  if (salt) {
    hash.update(salt);
  }

  hash.update(data);

  return hash.digest('hex');
}
