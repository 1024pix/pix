import { databaseBuffer } from '../database-buffer.js';

const buildFeature = function buildFeature({ id = databaseBuffer.getNextId(), key, description } = {}) {
  const values = {
    id,
    key,
    description,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'features',
    values,
  });
};

export { buildFeature };
