import isUndefined from 'lodash/isUndefined.js';

import { databaseBuffer } from '../database-buffer.js';
import { buildAttestation } from './build-attestation.js';
import { buildUser } from './build-user.js';

const buildProfileReward = function ({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  rewardType = 'attestations',
  rewardId,
  userId,
} = {}) {
  userId = isUndefined(userId) ? buildUser().id : userId;
  rewardId = isUndefined(rewardId) && rewardType === 'attestations' ? buildAttestation().id : rewardId;

  const values = {
    id,
    createdAt,
    rewardType,
    rewardId,
    userId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'profile-rewards',
    values,
  });
};

export { buildProfileReward };
