import { databaseBuffer } from '../database-buffer.js';

export const buildCertificationChallengeCapacity = ({ certificationChallengeId, capacity, createdAt }) => {
  return databaseBuffer.pushInsertable({
    tableName: 'certification-challenge-capacities',
    values: {
      certificationChallengeId,
      capacity,
      createdAt,
    },
  });
};
