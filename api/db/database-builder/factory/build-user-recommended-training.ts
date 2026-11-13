import { databaseBuffer } from '../database-buffer.ts';
import { buildTraining } from './build-training.js';

type UserRecommendedTrainingAttributes = {
  id?: number;
  userId?: number;
  trainingId?: number | null;
  campaignParticipationId?: number | null;
  isRelevant?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
};

const buildUserRecommendedTraining = ({
  id = databaseBuffer.getNextId(),
  userId,
  trainingId,
  campaignParticipationId,
  isRelevant,
  createdAt = new Date(),
  updatedAt = new Date(),
}: UserRecommendedTrainingAttributes = {}) => {
  return databaseBuffer.pushInsertable({
    tableName: 'user-recommended-trainings',
    values: {
      id,
      userId,
      trainingId: trainingId || buildTraining().id,
      campaignParticipationId,
      isRelevant,
      createdAt,
      updatedAt,
    },
  });
};

export { buildUserRecommendedTraining };
