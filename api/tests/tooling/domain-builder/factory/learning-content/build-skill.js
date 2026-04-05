import { Skill, STATUSES } from '../../../../../src/learning-content/domain/models/Skill.js';

export const buildSkill = function ({
  id = 'foo id',
  name = 'foo name',
  pixValue = 10,
  version = 11,
  level = 12,
  status = STATUSES.ACTIVE,
  hintStatus = 'foo hintStatus',
  hint_i18n = { fr: 'le foo', en: 'the foo' },
  competenceId = 'foo competenceId',
  tubeId = 'foo tubeId',
  tutorialIds = ['foo tutorialId'],
  learningMoreTutorialIds = ['foo learningMoreTutorialId'],
} = {}) {
  return new Skill({
    id,
    name,
    pixValue,
    version,
    level,
    status,
    hintStatus,
    hint_i18n,
    competenceId,
    tubeId,
    tutorialIds,
    learningMoreTutorialIds,
  });
};

buildSkill.STATUSES = STATUSES;
