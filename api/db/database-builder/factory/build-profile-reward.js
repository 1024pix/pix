import isUndefined from 'lodash/isUndefined.js';

import { REWARD_TYPES } from '../../../src/quest/domain/constants.js';
import { PROFILE_REWARDS_TABLE_NAME } from '../../migrations/20240820101213_add-profile-rewards-table.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildAttestation } from './build-attestation.js';
import { buildUser } from './build-user.js';

const buildProfileReward = function ({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  rewardType = REWARD_TYPES.ATTESTATION,
  rewardId,
  userId,
} = {}) {
  userId = isUndefined(userId) ? buildUser().id : userId;
  rewardId = isUndefined(rewardId) && rewardType === REWARD_TYPES.ATTESTATION ? buildAttestation().id : rewardId;

  const values = {
    id,
    createdAt,
    rewardType,
    rewardId,
    userId,
  };

  return databaseBuffer.pushInsertable({
    tableName: PROFILE_REWARDS_TABLE_NAME,
    values,
  });
};

export { buildProfileReward };
