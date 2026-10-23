import { databaseBuffer } from '../database-buffer.ts';

const buildResetPasswordDemand = function ({
  id = databaseBuffer.getNextId(),
  email = 'example@example.net',
  temporaryKey = 'ABCD12345',
  used = false,
  createdAt,
  updatedAt,
} = {}) {
  const values = {
    id,
    email,
    temporaryKey,
    used,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'reset-password-demands',
    values,
  });
};

export { buildResetPasswordDemand };
