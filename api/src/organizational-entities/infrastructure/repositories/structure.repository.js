import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Structure } from '../../domain/models/Structure.js';

const FACT_STRUCTURE_COLUMNS = ['structure_id', 'organization_id', 'certification_center_id'];

/**
 * @param {object} params
 * @param {number} params.organizationId
 * @returns {Promise<Structure | null>}
 */
const findByOrganizationId = async function ({ organizationId }) {
  const knexConn = DomainTransaction.getConnection();
  const structure = await _selectStructures(knexConn)
    .where({ 'fct_structures.organization_id': organizationId })
    .first();

  return structure ? _toDomain(structure) : null;
};

/**
 * @param {object} params
 * @param {number} params.certificationCenterId
 * @returns {Promise<Structure | null>}
 */
const findByCertificationCenterId = async function ({ certificationCenterId }) {
  const knexConn = DomainTransaction.getConnection();
  const structure = await _selectStructures(knexConn)
    .where({ 'fct_structures.certification_center_id': certificationCenterId })
    .first();

  return structure ? _toDomain(structure) : null;
};

/**
 *
 * @param {object} params
 * @param {number} params.structureId
 * @returns {Promise<void>}
 */
const deleteStructure = async function ({ structureId }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('fct_structures').where({ structure_id: structureId }).delete();
  await knexConn('structures').where({ id: structureId }).delete();
};

/**
 * @param {Structure} structure
 * @returns {Promise<Structure>}
 */
const save = async function (structure) {
  const knexConn = DomainTransaction.getConnection();
  const factStructureAttributes = {
    organization_id: structure.organizationId,
    certification_center_id: structure.certificationCenterId,
  };

  if (structure.id) {
    await knexConn('fct_structures').where({ structure_id: structure.id }).update(factStructureAttributes);
    const updatedStructure = await _selectStructures(knexConn)
      .where({ 'fct_structures.structure_id': structure.id })
      .first();
    return _toDomain(updatedStructure);
  }

  const [{ id: structureId, category_id }] = await knexConn('structures')
    .insert({ category_id: structure.categoryId })
    .returning(['id', 'category_id']);
  const [createdFactStructure] = await knexConn('fct_structures')
    .insert({ structure_id: structureId, ...factStructureAttributes })
    .returning(FACT_STRUCTURE_COLUMNS);

  return _toDomain({ ...createdFactStructure, category_id });
};

function _selectStructures(knexConn) {
  return knexConn
    .select({
      structure_id: 'fct_structures.structure_id',
      organization_id: 'fct_structures.organization_id',
      certification_center_id: 'fct_structures.certification_center_id',
      category_id: 'structures.category_id',
    })
    .from('fct_structures')
    .join('structures', 'structures.id', 'fct_structures.structure_id');
}

function _toDomain(structure) {
  return new Structure({
    id: structure.structure_id,
    organizationId: structure.organization_id,
    certificationCenterId: structure.certification_center_id,
    categoryId: structure.category_id,
  });
}

export { deleteStructure, findByCertificationCenterId, findByOrganizationId, save };
