import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { StructureCategory } from '../../domain/models/StructureCategory.js';

/**
 * @function
 * @returns {Promise<Array<StructureCategory>>}
 */
const findAll = async function () {
  const knexConn = DomainTransaction.getConnection();
  const structureCategories = await knexConn.select('id', 'label').from('structure_categories').orderBy('id');

  return structureCategories.map(_toDomain);
};

const _toDomain = function (structureCategoryDTO) {
  return new StructureCategory({
    id: structureCategoryDTO.id,
    label: structureCategoryDTO.label,
  });
};

export { findAll };
