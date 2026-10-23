import { databaseBuffer } from '../../database-buffer.ts';

export function buildMission({
  id = 1,
  status = 'status Mission A',
  name_i18n = { fr: 'name FR Mission A', en: 'name EN Mission A' },
  content = { some: 'content' },
  learningObjectives_i18n = { fr: 'learningObjectives FR Mission A', en: 'learningObjectives EN Mission A' },
  validatedObjectives_i18n = { fr: 'validatedObjectives FR Mission A', en: 'validatedObjectives EN Mission A' },
  introductionMediaType = 'introductionMediaType Mission A',
  introductionMediaUrl = 'introductionMediaUrl Mission A',
  introductionMediaAlt_i18n = { fr: 'introductionMediaAlt FR Mission A', en: 'introductionMediaAlt EN Mission A' },
  documentationUrl = 'documentationUrl Mission A',
  cardImageUrl = 'cardImageUrl Mission A',
  competenceId = null,
} = {}) {
  return buildMissionInDB({
    id,
    status,
    name_i18n,
    content,
    learningObjectives_i18n,
    validatedObjectives_i18n,
    introductionMediaType,
    introductionMediaUrl,
    introductionMediaAlt_i18n,
    documentationUrl,
    cardImageUrl,
    competenceId,
  });
}

export function buildMissionWithNoDefaultValues({
  id,
  status,
  name_i18n,
  content,
  learningObjectives_i18n,
  validatedObjectives_i18n,
  introductionMediaType,
  introductionMediaUrl,
  introductionMediaAlt_i18n,
  documentationUrl,
  cardImageUrl,
  competenceId,
}) {
  return buildMissionInDB({
    id,
    status,
    name_i18n,
    content,
    learningObjectives_i18n,
    validatedObjectives_i18n,
    introductionMediaType,
    introductionMediaUrl,
    introductionMediaAlt_i18n,
    documentationUrl,
    cardImageUrl,
    competenceId,
  });
}

function buildMissionInDB({
  id,
  status,
  name_i18n,
  content,
  learningObjectives_i18n,
  validatedObjectives_i18n,
  introductionMediaType,
  introductionMediaUrl,
  introductionMediaAlt_i18n,
  documentationUrl,
  cardImageUrl,
  competenceId,
}) {
  const values = {
    id,
    status,
    name_i18n,
    content,
    learningObjectives_i18n,
    validatedObjectives_i18n,
    introductionMediaType,
    introductionMediaUrl,
    introductionMediaAlt_i18n,
    documentationUrl,
    cardImageUrl,
    competenceId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'learningcontent.missions',
    values,
  });
}
