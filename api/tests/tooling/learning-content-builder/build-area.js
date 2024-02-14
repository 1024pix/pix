const buildArea = function ({
  id = 'areaId',
  code = 'areaCode',
  name = 'areaName',
  title_i18n = {
    fr: 'fr',
    en: 'eng,',
  },
  color = 'areaColor',
  frameworkId = 'frameworkId',
  competenceIds = ['competenceId'],
} = {}) {
  return {
    id,
    code,
    name,
    title_i18n,
    color,
    frameworkId,
    competenceIds,
  };
};

export { buildArea };
