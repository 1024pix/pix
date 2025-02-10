import isUndefined from 'lodash/isUndefined.js';

import { REWARD_TYPES } from '../../../src/quest/domain/constants.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildAttestation } from './build-attestation.js';

const buildQuest = function ({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  updatedAt,
  rewardType = REWARD_TYPES.ATTESTATION,
  rewardId,
  eligibilityRequirements = [],
  successRequirements,
} = {}) {
  rewardId = isUndefined(rewardId) && rewardType === REWARD_TYPES.ATTESTATION ? buildAttestation().id : rewardId;
  const eligibilityRequirementsForDB = JSON.stringify(eligibilityRequirements);
  const successRequirementsForDB = JSON.stringify(successRequirements);

  const values = {
    id,
    createdAt,
    updatedAt: updatedAt ?? createdAt,
    rewardType,
    rewardId,
    eligibilityRequirements: eligibilityRequirementsForDB,
    successRequirements: successRequirementsForDB,
  };

  const insertedValues = databaseBuffer.pushInsertable({
    tableName: 'quests',
    values,
  });
  return {
    ...insertedValues,
    eligibilityRequirements,
    successRequirements,
  };
};

export { buildQuest };
