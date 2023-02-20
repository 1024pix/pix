import databaseBuffer from '../database-buffer';

export default function buildTutorialEvaluation({
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
}
