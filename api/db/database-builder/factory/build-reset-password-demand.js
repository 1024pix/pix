import databaseBuffer from '../database-buffer';

export default function buildResetPasswordDemand({
  id = databaseBuffer.getNextId(),
  email = 'example@example.net',
  temporaryKey = 'ABCD12345',
  used = false,
} = {}) {
  const values = {
    id,
    email,
    temporaryKey,
    used,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'reset-password-demands',
    values,
  });
}
