import { databaseBuffer } from '../../database-buffer.ts';

export function buildThematic({
  id = 'thematicIdA',
  name_i18n = { fr: 'name FR Thématique A', en: 'name EN Thématique A' },
  index = 8,
  competenceId = null,
  tubeIds = [],
} = {}) {
  return buildThematicInDB({
    id,
    name_i18n,
    index,
    competenceId,
    tubeIds,
  });
}

export function buildThematicWithNoDefaultValues({ id, name_i18n, index, competenceId, tubeIds }) {
  return buildThematicInDB({
    id,
    name_i18n,
    index,
    competenceId,
    tubeIds,
  });
}

function buildThematicInDB({ id, name_i18n, index, competenceId, tubeIds }) {
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
