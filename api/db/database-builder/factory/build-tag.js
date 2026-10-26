import { databaseBuffer } from '../database-buffer.ts';

const buildTag = function ({ id = databaseBuffer.getNextId(), name = 'Tag' } = {}) {
  const values = {
    id,
    name,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'tags',
    values,
  });
};

export { buildTag };
