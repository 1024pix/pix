import { databaseBuffer } from '../../database-buffer.js';

export function buildArea({
  id = 'areaIdA',
  code = 'code Domaine A',
  name = 'name Domaine A',
  title_i18n = { fr: 'title FR Domaine A', en: 'title EN Domaine A' },
  color = 'color Domaine A',
  frameworkId = null,
  competenceIds = [],
} = {}) {
  const values = {
    id,
    code,
    name,
    title_i18n,
    color,
    frameworkId,
    competenceIds,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'learningcontent.areas',
    values,
  });
}
