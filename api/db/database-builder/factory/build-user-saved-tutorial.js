import { databaseBuffer } from '../database-buffer.ts';

const buildUserSavedTutorial = function ({
  id = databaseBuffer.getNextId(),
  tutorialId,
  userId,
  skillId = null,
  createdAt = new Date(),
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'user-saved-tutorials',
    values: { id, userId, tutorialId, skillId, createdAt },
  });
};

export { buildUserSavedTutorial };
