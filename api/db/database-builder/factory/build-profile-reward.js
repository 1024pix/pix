import isUndefined from 'lodash/isUndefined.js';

import { REWARD_TYPES } from '../../../src/quest/domain/constants.js';
import { databaseBuffer } from '../database-buffer.ts';
import { buildUser } from './build-user.js';

const buildProfileReward = function ({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  rewardType = REWARD_TYPES.ATTESTATION,
  rewardId,
  userId,
} = {}) {
  userId = isUndefined(userId) ? buildUser().id : userId;

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
