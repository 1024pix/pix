import { databaseBuffer } from '../database-buffer.js';

export const buildCertificationChallengeCapacity = ({ answerId, capacity, certificationChallengeId, createdAt }) => {
  return databaseBuffer.pushInsertable({
    tableName: 'certification-challenge-capacities',
    values: {
      answerId,
      capacity,
      certificationChallengeId,
      createdAt,
    },
  });
};
