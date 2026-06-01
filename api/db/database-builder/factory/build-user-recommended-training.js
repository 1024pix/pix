import { USER_RECOMMENDED_TRAININGS_TABLE_NAME } from '../../migrations/20221017085933_create-user-recommended-trainings.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildTraining } from './build-training.js';

const buildUserRecommendedTraining = function ({
  id = databaseBuffer.getNextId(),
  userId,
  trainingId,
  campaignParticipationId,
  isRelevant,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {
  if (!trainingId) {
    trainingId = buildTraining().id;
  }
  return databaseBuffer.pushInsertable({
    tableName: USER_RECOMMENDED_TRAININGS_TABLE_NAME,
    values: { id, userId, trainingId, campaignParticipationId, isRelevant, createdAt, updatedAt },
  });
};

export { buildUserRecommendedTraining };
