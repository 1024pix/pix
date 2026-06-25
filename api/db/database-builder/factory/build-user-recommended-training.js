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
    tableName: 'user-recommended-trainings',
    values: { id, userId, trainingId, campaignParticipationId, isRelevant, createdAt, updatedAt },
  });
};

export { buildUserRecommendedTraining };
