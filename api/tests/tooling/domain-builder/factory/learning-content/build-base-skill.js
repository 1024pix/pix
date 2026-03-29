import { BaseSkill } from '../../../../../src/learning-content/domain/models/BaseSkill.js';

export function buildBaseSkill({
  id = 'skillFoo123',
  name = '@fooBar3',
  pixValue = 0.96,
  version = 1,
  level = 3,
  status = 'actif',
  hintStatus = 'Validé',
  hint_i18n,
  tutorialIds = null,
  learningMoreTutorialIds = null,
  tubeId = 'tubeFoo123',
  competenceId = 'competenceFoo123',
} = {}) {
  return new BaseSkill({
    id,
    name,
    pixValue,
    version,
    level,
    status,
    hintStatus,
    hint_i18n: hint_i18n ?? { fr: 'foo hint' },
    tutorialIds,
    learningMoreTutorialIds,
    tubeId,
    competenceId,
  });
}
