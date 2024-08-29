const buildCompetence = function ({
  id = 'competenceId',
  index = 'competenceIndex',
  origin = 'competenceOrigin',
  name_i18n = {
    fr: 'name_fr',
    en: 'name_eng',
  },
  description_i18n = {
    fr: 'description_fr',
    en: 'description_eng',
  },
  skillIds = ['someSkillId'],
  thematicIds = ['someThematicId'],
  areaId = 'parentAreaId',
} = {}) {
  return {
    id,
    index,
    origin,
    name_i18n,
    description_i18n,
    skillIds,
    thematicIds,
    areaId,
  };
};

export { buildCompetence };
