import _ from 'lodash';

import { knex } from '../../../db/knex-database-connection.js';
import { CenterForAdmin } from '../../../src/certification/enrolment/domain/models/CenterForAdmin.js';

const save = async function (certificationCenter) {
  const data = _toDTO(certificationCenter);
  const [certificationCenterCreated] = await knex('certification-centers').returning('*').insert(data);
  return _toDomain(certificationCenterCreated);
};

const update = async function (certificationCenter) {
  const data = _toDTO(certificationCenter);
  return knex('certification-centers').update(data).where({ id: certificationCenter.id });
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
