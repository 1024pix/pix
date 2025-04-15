import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { CenterForAdmin } from '../../domain/models/CenterForAdmin.js';

const save = async function (certificationCenter) {
  const knexConn = DomainTransaction.getConnection();
  const [certificationCenterCreated] = await knexConn('certification-centers').returning('*').insert({
    name: certificationCenter.name,
    type: certificationCenter.type,
    externalId: certificationCenter.externalId,
  });
  return _toDomain(certificationCenterCreated);
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

export { archive, save, update };

function _toDomain(certificationCenterDTO) {
  return new CenterForAdmin({
    center: {
      id: certificationCenterDTO.id,
      type: certificationCenterDTO.type,
      habilitations: [],
      name: certificationCenterDTO.name,
      externalId: certificationCenterDTO.externalId,
      createdAt: certificationCenterDTO.createdAt,
      updatedAt: certificationCenterDTO.updatedAt,
      isComplementaryAlonePilot: undefined,
    },
  });
}
