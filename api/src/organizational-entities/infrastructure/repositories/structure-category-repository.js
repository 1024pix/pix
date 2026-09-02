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

/**
 * @function
 * @param {number} id
 * @returns {Promise<StructureCategory|null>}
 */
const findById = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  const structureCategory = await knexConn.select('id', 'label').from('structure_categories').where({ id }).first();

  if (!structureCategory) {
    return null;
  }

  return _toDomain(structureCategory);
};

const _toDomain = function (structureCategoryDTO) {
  return new StructureCategory({
    id: structureCategoryDTO.id,
    label: structureCategoryDTO.label,
  });
};

export { findAll, findById };
