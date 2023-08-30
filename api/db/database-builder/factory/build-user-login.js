import { databaseBuffer } from '../database-buffer.js';
import { buildUser } from './build-user.js';

function buildUserLogin({
  id = databaseBuffer.getNextId(),
  userId = null,
  failureCount = 0,
  temporaryBlockedUntil = null,
  blockedAt = null,
  createdAt = new Date(),
  updatedAt = new Date(),
  lastLoggedAt = null,
} = {}) {
  if (!userId) {
    userId = buildUser().id;
  }

  const values = {
    id,
    userId,
    failureCount,
    temporaryBlockedUntil,
    blockedAt,
    createdAt,
    updatedAt,
    lastLoggedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'user-logins',
    values,
  });
}
export { buildUserLogin };
