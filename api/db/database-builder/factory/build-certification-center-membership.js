import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.ts';
import { buildCertificationCenter } from './build-certification-center.js';
import { buildUser } from './build-user.ts';

/**
 * @param {{
 *   id?: number,
 *   userId?: number,
 *   updatedByUserId?: number | null,
 *   certificationCenterId?: number,
 *   createdAt?: Date,
 *   updatedAt?: Date,
 *   disabledAt?: Date | null,
 *   isReferer?: boolean,
 *   role?: string,
 *   lastAccessedAt?: Date | null,
 * }} [attributes]
 */
const buildCertificationCenterMembership = function ({
  id = databaseBuffer.getNextId(),
  userId,
  updatedByUserId,
  certificationCenterId,
  createdAt = new Date(),
  updatedAt,
  disabledAt,
  isReferer = false,
  role = 'MEMBER',
  lastAccessedAt,
} = {}) {
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  certificationCenterId = _.isUndefined(certificationCenterId) ? buildCertificationCenter().id : certificationCenterId;

  if (!updatedAt) {
    updatedAt = disabledAt || createdAt;
  }

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
    lastAccessedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-center-memberships',
    values,
  });
};

export { buildCertificationCenterMembership };
