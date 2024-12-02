import { databaseBuffer } from '../../database-buffer.js';

export function buildCompetence({
  id = 'competenceIdA',
  name_i18n = { fr: 'name FR Compétence A', en: 'name EN Compétence A' },
  description_i18n = { fr: 'description FR Compétence A', en: 'description EN Compétence A' },
  index = 'index Compétence A',
  origin = 'origin Compétence A',
  areaId = null,
  skillIds = [],
  thematicIds = [],
} = {}) {
  const values = {
    id,
    name_i18n,
    description_i18n,
    index,
    origin,
    areaId,
    skillIds,
    thematicIds,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'learningcontent.competences',
    values,
  });
}
