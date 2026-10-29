import { databaseBuffer } from '../database-buffer.ts';
import { buildStructureCategory } from './build-structure-category.js';

const buildStructure = function ({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  updatedAt,
  categoryId = buildStructureCategory().id,
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
