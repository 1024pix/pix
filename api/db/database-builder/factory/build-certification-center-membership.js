import _ from 'lodash';
import { databaseBuffer } from '../database-buffer.js';
import { buildCertificationCenter } from './build-certification-center.js';
import { buildUser } from './build-user.js';

const buildCertificationCenterMembership = function ({
  id = databaseBuffer.getNextId(),
  userId,
  updatedByUserId,
  certificationCenterId,
  createdAt = new Date('2020-01-01'),
  disabledAt,
  isReferer = false,
} = {}) {
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  certificationCenterId = _.isUndefined(certificationCenterId) ? buildCertificationCenter().id : certificationCenterId;

  const values = {
    id,
    userId,
    updatedByUserId,
    certificationCenterId,
    createdAt,
    disabledAt,
    isReferer,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-center-memberships',
    values,
  });
};

export { buildCertificationCenterMembership };
