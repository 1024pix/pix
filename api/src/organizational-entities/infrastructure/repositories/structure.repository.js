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
  const structure = await knexConn
    .select(FACT_STRUCTURE_COLUMNS)
    .from('fct_structures')
    .where({ organization_id: organizationId })
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
  const structure = await knexConn
    .select(FACT_STRUCTURE_COLUMNS)
    .from('fct_structures')
    .where({ certification_center_id: certificationCenterId })
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
 * Creates the structure when it has no id, updates it otherwise.
 *
 * @type {function}
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
    const [updatedFactStructure] = await knexConn('fct_structures')
      .where({ structure_id: structure.id })
      .update(factStructureAttributes)
      .returning(FACT_STRUCTURE_COLUMNS);
    return _toDomain(updatedFactStructure);
  }

  const [{ id: structureId }] = await knexConn('structures').insert({}).returning('id');
  const [createdFactStructure] = await knexConn('fct_structures')
    .insert({ structure_id: structureId, ...factStructureAttributes })
    .returning(FACT_STRUCTURE_COLUMNS);

  return _toDomain(createdFactStructure);
};

function _toDomain(structure) {
  return new Structure({
    id: structure.structure_id,
    organizationId: structure.organization_id,
    certificationCenterId: structure.certification_center_id,
  });
}

export { deleteStructure, findByCertificationCenterId, findByOrganizationId, save };
