import { UserSavedTutorial } from '../../../../lib/domain/models/UserSavedTutorial.js';

const buildUserSavedTutorial = function ({
  id = 111,
  userId = '4044',
  tutorialId = '111',
  skillId = '1212',
  createdAt = '2022-05-02',
} = {}) {
  return new UserSavedTutorial({
    id,
    skillId,
    userId,
    tutorialId,
    createdAt,
  });
};

export { buildUserSavedTutorial };
