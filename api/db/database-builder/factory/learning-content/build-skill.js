import { databaseBuffer } from '../../database-buffer.ts';

export function buildSkill({
  id = 'skillIdA',
  name = 'name Acquis A',
  status = 'status Acquis A',
  pixValue = 2.9,
  version = 5,
  level = 2,
  hintStatus = 'hintStatus Acquis A',
  competenceId = null,
  tubeId = null,
  tutorialIds = [],
  learningMoreTutorialIds = [],
  hint_i18n = { fr: 'Un indice' },
} = {}) {
  return buildSkillInDB({
    id,
    name,
    status,
    pixValue,
    version,
    level,
    hintStatus,
    competenceId,
    tubeId,
    tutorialIds,
    learningMoreTutorialIds,
    hint_i18n,
  });
}

export function buildSkillWithNoDefaultValues({
  id,
  name,
  status,
  pixValue,
  version,
  level,
  hintStatus,
  competenceId,
  tubeId,
  tutorialIds,
  learningMoreTutorialIds,
  hint_i18n,
}) {
  return buildSkillInDB({
    id,
    name,
    status,
    pixValue,
    version,
    level,
    hintStatus,
    competenceId,
    tubeId,
    tutorialIds,
    learningMoreTutorialIds,
    hint_i18n,
  });
}

function buildSkillInDB({
  id,
  name,
  status,
  pixValue,
  version,
  level,
  hintStatus,
  competenceId,
  tubeId,
  tutorialIds,
  learningMoreTutorialIds,
  hint_i18n,
}) {
  const values = {
    id,
    name,
    status,
    pixValue,
    version,
    level,
    hintStatus,
    competenceId,
    tubeId,
    tutorialIds,
    learningMoreTutorialIds,
    hint_i18n,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'learningcontent.skills',
    values,
  });
}
