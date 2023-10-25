import _ from 'lodash';
import { databaseBuffer } from '../database-buffer.js';
import { buildCertificationCenter } from './build-certification-center.js';
import { buildUser } from './build-user.js';
import { CERTIFICATION_CENTER_MEMBERSHIP_ROLES } from '../../../lib/domain/models/CertificationCenterMembership.js';

const buildCertificationCenterMembership = function ({
  id = databaseBuffer.getNextId(),
  userId,
  updatedByUserId,
  certificationCenterId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2023-09-12'),
  disabledAt,
  isReferer = false,
  role = CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER,
} = {}) {
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  certificationCenterId = _.isUndefined(certificationCenterId) ? buildCertificationCenter().id : certificationCenterId;

  const values = {
    id,
    userId,
    updatedByUserId,
    certificationCenterId,
    createdAt,
    updatedAt,
    disabledAt,
    isReferer,
    role,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-center-memberships',
    values,
  });
};

export { buildCertificationCenterMembership };
