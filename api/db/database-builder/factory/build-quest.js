import isUndefined from 'lodash/isUndefined.js';

import { databaseBuffer } from '../database-buffer.js';
import { buildAttestation } from './build-attestation.js';

const buildQuest = function ({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  rewardType = 'attestations',
  rewardId,
  eligibilityRequirements,
  successRequirements,
} = {}) {
  rewardId = isUndefined(rewardId) && rewardType === 'attestations' ? buildAttestation().id : rewardId;
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
