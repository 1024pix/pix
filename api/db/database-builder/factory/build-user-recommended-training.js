import { databaseBuffer } from '../database-buffer.js';

const buildUserRecommendedTraining = function ({
  id = databaseBuffer.getNextId(),
  userId,
  trainingId,
  campaignParticipationId,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'user-recommended-trainings',
    values: { id, userId, trainingId, campaignParticipationId, createdAt, updatedAt },
  });
};

export { buildUserRecommendedTraining };
