import { databaseBuffer } from '../database-buffer.js';

const buildStructureCategory = function ({
  id = databaseBuffer.getNextId(),
  label = 'Structure - Catégorie - socio-culturelle et anticonstitutionnelle',
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
