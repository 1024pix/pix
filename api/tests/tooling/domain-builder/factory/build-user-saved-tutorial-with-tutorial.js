import { UserSavedTutorialWithTutorial } from '../../../../lib/domain/models/UserSavedTutorialWithTutorial.js';
import { buildSkill } from './build-skill.js';
import { buildTutorial } from './build-tutorial.js';
import { buildUser } from './build-user.js';

const buildUserSavedTutorialWithTutorial = function ({
  id = 123,
  userId = buildUser().id,
  skillId = buildSkill().id,
  tutorial = buildTutorial(),
} = {}) {
  return new UserSavedTutorialWithTutorial({
    id,
    userId,
    skillId,
    tutorial,
  });
};

export { buildUserSavedTutorialWithTutorial };
