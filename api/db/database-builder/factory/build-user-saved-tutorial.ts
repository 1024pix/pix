import { databaseBuffer } from '../database-buffer.ts';

type UserSavedTutorialAttributes = {
  id?: number;
  tutorialId?: string;
  userId?: number;
  skillId?: string | null;
  createdAt?: Date;
};

const buildUserSavedTutorial = ({
  id = databaseBuffer.getNextId(),
  tutorialId,
  userId,
  skillId = null,
  createdAt = new Date(),
}: UserSavedTutorialAttributes = {}) => {
  return databaseBuffer.pushInsertable({
    tableName: 'user-saved-tutorials',
    values: { id, userId, tutorialId, skillId, createdAt },
  });
};

export { buildUserSavedTutorial };
