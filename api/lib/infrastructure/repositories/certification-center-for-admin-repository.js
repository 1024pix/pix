import _ from 'lodash';

import { knex } from '../../../db/knex-database-connection.js';
import { CenterForAdmin } from '../../../src/certification/session-management/domain/models/CenterForAdmin.js';

const save = async function (certificationCenter) {
  const data = _toDTO(certificationCenter);
  const [certificationCenterCreated] = await knex('certification-centers').returning('*').insert(data);
  return _toDomain(certificationCenterCreated);
};

const update = async function (certificationCenter) {
  const data = _toDTO(certificationCenter);

  const [certificationCenterRow] = await knex('certification-centers')
    .update(data)
    .where({ id: certificationCenter.id })
    .returning('*');

  return _toDomain(certificationCenterRow);
};

export { save, update };

function _toDomain(certificationCenterDTO) {
  return new CenterForAdmin({
    center: certificationCenterDTO,
  });
}

function _toDTO(certificationCenter) {
  return _.pick(certificationCenter, ['name', 'type', 'externalId', 'isV3Pilot']);
}
