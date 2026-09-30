import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Structure } from '../../domain/models/Structure.js';

/**
 * @param {object} params
 * @param {number} params.organizationId
 * @returns {Promise<Structure | null>}
 */
const findByOrganizationId = async function ({ organizationId }) {
  const knexConn = DomainTransaction.getConnection();
  const structure = await knexConn
    .select('structure_id', 'organization_id', 'certification_center_id')
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
    .select('structure_id', 'organization_id', 'certification_center_id')
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
 * @type {function}
 * @param {Structure} structure
 * @returns {Promise<void>}
 */
const update = async function (structure) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('fct_structures').where({ structure_id: structure.id }).update({
    organization_id: structure.organizationId,
    certification_center_id: structure.certificationCenterId,
  });
};

function _toDomain(structure) {
  return new Structure({
    id: structure.structure_id,
    organizationId: structure.organization_id,
    certificationCenterId: structure.certification_center_id,
  });
}

export { deleteStructure, findByCertificationCenterId, findByOrganizationId, update };
