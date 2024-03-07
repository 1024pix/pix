import { databaseBuffer } from '../database-buffer.js';

const buildPassage = ({
  id = databaseBuffer.getNextId(),
  moduleId = 'mon-super-module',
  userId = null,
  createdAt = new Date('2024-01-01'),
  updatedAt = new Date('2024-01-01'),
  terminatedAt = null,
} = {}) => {
  const values = {
    id,
    moduleId,
    userId,
    createdAt,
    updatedAt,
    terminatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'passages',
    values,
  });
};

export { buildPassage };
