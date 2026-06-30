import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { AttachedCertificationCenter } from '../../domain/models/AttachedCertificationCenter.js';
import { CenterForAdmin } from '../../domain/models/CenterForAdmin.js';

const save = async function (certificationCenter) {
  const knexConn = DomainTransaction.getConnection();
  const [certificationCenterCreated] = await knexConn('certification-centers').returning('*').insert({
    name: certificationCenter.name,
    type: certificationCenter.type,
    externalId: certificationCenter.externalId,
    createdBy: certificationCenter.createdBy,
  });
  return _toDomainCenterForAdmin(certificationCenterCreated);
};

const update = async function (certificationCenter) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-centers')
    .update({
      name: certificationCenter.name,
      type: certificationCenter.type,
      externalId: certificationCenter.externalId,
    })
    .where({ id: certificationCenter.id });
};

/**
 * @type {function}
 * @param {Object} params
 * @param {string|number} params.certificationCenterId
 * @param {string|number} params.archivedBy
 * @param {date} params.archiveDate
 */
const archive = async function ({ certificationCenterId, archivedBy, archiveDate }) {
  const knexConn = DomainTransaction.getConnection();
  const certificationCenter = await knexConn('certification-centers').where({ id: certificationCenterId }).first();
  if (!certificationCenter) {
    throw new NotFoundError();
  }
  if (certificationCenter.archivedBy) {
    return;
  }
  await knexConn('certification-centers')
    .where({ id: certificationCenterId })
    .update({ archivedBy, archivedAt: archiveDate });
};

/**
 * @type {function}
 * @param {number} organizationId
 * @returns {Promise<AttachedCertificationCenter[]>}
 */
const findAttachedByOrganizationId = async (organizationId) => {
  const knexConn = DomainTransaction.getConnection();
  const certificationCenters = await knexConn('fct_structures')
    .select({
      id: 'certification-centers.id',
      name: 'certification-centers.name',
      externalId: 'certification-centers.externalId',
    })
    .rightJoin('certification-centers', 'certification-centers.id', 'fct_structures.certification_center_id')
    .where({ organization_id: organizationId });

  return certificationCenters.map(
    (certificationCenter) =>
      new AttachedCertificationCenter({
        id: certificationCenter.id,
        name: certificationCenter.name,
        externalId: certificationCenter.externalId,
      }),
  );
};

/**
 * @type {function}
 * @param {object} params
 * @param {number} params.certificationCenterId
 * @return {Promise<boolean>}
 */
const exists = async function ({ certificationCenterId }) {
  const knexConnection = DomainTransaction.getConnection();
  const certificationCenter = await knexConnection('certification-centers')
    .select('id')
    .where({ id: certificationCenterId })
    .first();

  return Boolean(certificationCenter);
};

export { archive, exists, findAttachedByOrganizationId, save, update };

function _toDomainCenterForAdmin(certificationCenterDTO) {
  return new CenterForAdmin({
    center: {
      id: certificationCenterDTO.id,
      type: certificationCenterDTO.type,
      habilitations: [],
      name: certificationCenterDTO.name,
      externalId: certificationCenterDTO.externalId,
      createdAt: certificationCenterDTO.createdAt,
      createdBy: certificationCenterDTO.createdBy,
      updatedAt: certificationCenterDTO.updatedAt,
    },
  });
}
