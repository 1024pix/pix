import { databaseBuffer } from '../database-buffer.ts';
import { buildUser } from './build-user.js';

function buildLastUserApplicationConnection({
  id = databaseBuffer.getNextId(),
  userId,
  application,
  lastLoggedAt = new Date(),
} = {}) {
  if (!userId) {
    userId = buildUser().id;
  }

  const values = {
    id,
    userId,
    application,
    lastLoggedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'last-user-application-connections',
    values,
  });
}
export { buildLastUserApplicationConnection };
