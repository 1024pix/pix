import { databaseBuffer } from '../database-buffer.js';

const buildPassage = ({
  id = databaseBuffer.getNextId(),
  moduleId = 'c47ffa11-5785-434b-9ea8-8d70c877715b',
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
