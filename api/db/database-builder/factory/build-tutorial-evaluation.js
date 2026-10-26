import { databaseBuffer } from '../database-buffer.ts';

const buildTutorialEvaluation = function ({
  id = databaseBuffer.getNextId(),
  tutorialId,
  userId,
  status = 'LIKED',
  updatedAt = new Date(),
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'tutorial-evaluations',
    values: {
      id,
      userId,
      tutorialId,
      status,
      updatedAt,
    },
  });
};

export { buildTutorialEvaluation };
