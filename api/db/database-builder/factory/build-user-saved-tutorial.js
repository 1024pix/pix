import databaseBuffer from '../database-buffer';

export default function buildUserSavedTutorial({
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
}
