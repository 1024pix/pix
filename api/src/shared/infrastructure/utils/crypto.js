import crypto from 'node:crypto';

export function generateHash(data) {
  if (!data) return null;

  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}
