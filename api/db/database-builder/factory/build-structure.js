import { databaseBuffer } from '../database-buffer.js';

const buildStructure = function ({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  updatedAt,
  categoryId = null,
} = {}) {
  const values = {
    id,
    created_at: createdAt,
    updated_at: updatedAt,
    category_id: categoryId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'structures',
    values,
  });
};

export { buildStructure };
