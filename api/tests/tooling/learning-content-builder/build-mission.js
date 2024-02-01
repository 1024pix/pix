const buildMission = function ({
  id = 'recCHAL1',
  name_i18n = {
    fr: 'Recherche sur Internet',
  },
  competenceId = 'recCOMP1',
  thematicId = undefined,
  learningObjectives_i18n = {
    fr: 'un objectif en français',
  },
  validatedObjectives_i18n = {
    fr: "une validation d'objectif en français",
  },
  status = undefined,
} = {}) {
  return {
    id,
    name_i18n,
    competenceId,
    thematicId,
    status,
    learningObjectives_i18n,
    validatedObjectives_i18n,
  };
};

export { buildMission };
