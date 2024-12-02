import { databaseBuffer } from '../../database-buffer.js';

export function buildThematic({
  id = 'thematicIdA',
  name_i18n = { fr: 'name FR Thématique A', en: 'name EN Thématique A' },
  index = 8,
  competenceId = null,
  tubeIds = [],
} = {}) {
  const values = {
    id,
    name_i18n,
    index,
    competenceId,
    tubeIds,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'learningcontent.thematics',
    values,
  });
}
