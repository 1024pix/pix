import { databaseBuffer } from '../database-buffer.js';

const buildPassage = ({
  id = databaseBuffer.getNextId(),
  moduleId = 'mon-super-module',
  userId = null,
  createdAt = new Date('2024-01-01'),
  updatedAt = new Date('2024-01-01'),
} = {}) => {
  const values = {
    id,
    moduleId,
    userId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'passages',
    values,
  });
};

export { buildPassage };
