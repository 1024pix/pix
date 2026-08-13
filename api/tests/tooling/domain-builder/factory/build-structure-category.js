import { StructureCategory } from '../../../../src/organizational-entities/domain/models/StructureCategory.js';

const buildStructureCategory = function ({ id = 1, label = 'Catégorie' } = {}) {
  return new StructureCategory({ id, label });
};

export { buildStructureCategory };
