import UserSavedTutorialWithTutorial from '../../../../lib/domain/models/UserSavedTutorialWithTutorial';
import buildSkill from './build-skill';
import buildTutorial from './build-tutorial';
import buildUser from './build-user';

export default function buildUserSavedTutorialWithTutorial({
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
}
