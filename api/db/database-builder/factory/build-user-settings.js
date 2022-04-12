import { buildUser } from './build-user.js';
import { databaseBuffer } from '../database-buffer.js';

const buildUserSettings = function ({ id = databaseBuffer.getNextId(), color = 'red', userId = buildUser().id } = {}) {
  const values = {
    id,
    color,
    userId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'user-settings',
    values,
  });
};

export { buildUserSettings };
