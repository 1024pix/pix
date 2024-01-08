import { databaseBuffer } from '../database-buffer.js';

const buildPassage = ({
  id = databaseBuffer.getNextId(),
  moduleId = 'mon-super-module',
  createdAt = new Date('2024-01-01'),
  updatedAt = new Date('2024-01-01'),
} = {}) => {
  const values = {
    id,
    moduleId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'passages',
    values,
  });
};

export { buildPassage };
