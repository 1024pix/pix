import _ from 'lodash';

import { CenterForAdmin } from '../../../src/certification/enrolment/domain/models/CenterForAdmin.js';
import { DomainTransaction } from '../DomainTransaction.js';

const save = async function (certificationCenter) {
  const knexConn = DomainTransaction.getConnection();
  const data = _toDTO(certificationCenter);
  const [certificationCenterCreated] = await knexConn('certification-centers').returning('*').insert(data);
  return _toDomain(certificationCenterCreated);
};

const update = async function (certificationCenter) {
  const knexConn = DomainTransaction.getConnection();
  const data = _toDTO(certificationCenter);
  return knexConn('certification-centers').update(data).where({ id: certificationCenter.id });
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

function _toDTO(certificationCenter) {
  return _.pick(certificationCenter, ['name', 'type', 'externalId', 'isV3Pilot']);
}
