import { databaseBuffer } from '../database-buffer.ts';

const buildStructureCategory = function ({
  id = databaseBuffer.getNextId(),
  label = `Structure - Catégorie - ${id}`,
} = {}) {
  const values = {
    id,
    label,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'structure_categories',
    values,
  });
};

export { buildStructureCategory };
