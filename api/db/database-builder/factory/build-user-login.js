import databaseBuffer from '../database-buffer';
import buildUser from './build-user';

function buildUserLogin({
  id = databaseBuffer.getNextId(),
  userId = null,
  failureCount = 0,
  temporaryBlockedUntil = null,
  blockedAt = null,
  createdAt = new Date(),
  updatedAt = new Date(),
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
  };
  return databaseBuffer.pushInsertable({
    tableName: 'user-logins',
    values,
  });
}
export default buildUserLogin;
