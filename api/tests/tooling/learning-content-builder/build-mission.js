const buildMission = function ({
  id = 1,
  name_i18n = {
    fr: 'Recherche sur Internet',
  },
  competenceId = 'recCOMP1',
  thematicId = 'recCHAL1',
  learningObjectives_i18n = {
    fr: 'un objectif en français',
  },
  validatedObjectives_i18n = {
    fr: "une validation d'objectif en français",
  },
  status = undefined,
  content,
} = {}) {
  return {
    id,
    name_i18n,
    competenceId,
    thematicId,
    status,
    learningObjectives_i18n,
    validatedObjectives_i18n,
    content,
  };
};

export { buildMission };
