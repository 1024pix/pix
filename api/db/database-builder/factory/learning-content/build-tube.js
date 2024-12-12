import { databaseBuffer } from '../../database-buffer.js';

export function buildTube({
  id = 'tubeIdA',
  name = 'name Tube A',
  title = 'title Tube A',
  description = 'description Tube A',
  practicalTitle_i18n = { fr: 'practicalTitle FR Tube A', en: 'practicalTitle EN Tube A' },
  practicalDescription_i18n = { fr: 'practicalDescription FR Tube A', en: 'practicalDescription EN Tube A' },
  competenceId = 'competenceIdA',
  thematicId = 'thematicIdA',
  skillIds = ['skillIdA'],
  isMobileCompliant = true,
  isTabletCompliant = true,
} = {}) {
  const values = {
    id,
    name,
    title,
    description,
    practicalTitle_i18n,
    practicalDescription_i18n,
    competenceId,
    thematicId,
    skillIds,
    isMobileCompliant,
    isTabletCompliant,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'learningcontent.tubes',
    values,
  });
}
