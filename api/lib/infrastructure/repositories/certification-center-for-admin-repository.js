import { CenterForAdmin } from '../../../src/certification/enrolment/domain/models/CenterForAdmin.js';
import { DomainTransaction } from '../DomainTransaction.js';

const save = async function (certificationCenter) {
  const knexConn = DomainTransaction.getConnection();
  const [certificationCenterCreated] = await knexConn('certification-centers').returning('*').insert({
    name: certificationCenter.name,
    type: certificationCenter.type,
    externalId: certificationCenter.externalId,
    isV3Pilot: certificationCenter.isV3Pilot,
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

export { save, update };

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
      isV3Pilot: certificationCenterDTO.isV3Pilot,
    },
  });
}
