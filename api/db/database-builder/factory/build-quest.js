import isUndefined from 'lodash/isUndefined.js';

import { REWARD_TYPES } from '../../../src/quest/domain/constants.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildAttestation } from './build-attestation.js';

const buildQuest = function ({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  rewardType = REWARD_TYPES.ATTESTATION,
  rewardId,
  eligibilityRequirements,
  successRequirements,
} = {}) {
  rewardId = isUndefined(rewardId) && rewardType === REWARD_TYPES.ATTESTATION ? buildAttestation().id : rewardId;
  eligibilityRequirements = JSON.stringify(eligibilityRequirements);
  successRequirements = JSON.stringify(successRequirements);

  const values = {
    id,
    createdAt,
    rewardType,
    rewardId,
    eligibilityRequirements,
    successRequirements,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'quests',
    values,
  });
};

export { buildQuest };
