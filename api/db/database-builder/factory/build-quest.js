import { databaseBuffer } from '../database-buffer.ts';

const buildQuest = function ({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  updatedAt,
  rewardType = null,
  rewardId = null,
  eligibilityRequirements = [],
  successRequirements = [],
} = {}) {
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
