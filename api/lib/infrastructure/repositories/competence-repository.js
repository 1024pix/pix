const _ = require('lodash');
const LearningContentResourceNotFound = require('../datasources/learning-content/LearningContentResourceNotFound.js');
const Competence = require('../../domain/models/Competence.js');
const { competenceDatasource } = require('../datasources/learning-content/competence-datasource.js');
const { NotFoundError } = require('../../domain/errors.js');
const { FRENCH_FRANCE } = require('../../domain/constants.js').LOCALE;
const { PIX_ORIGIN } = require('../../domain/constants.js');
const { getTranslatedKey } = require('../../domain/services/get-translated-text.js');

function _toDomain({ competenceData, locale }) {
  const translatedCompetenceName = getTranslatedKey(competenceData.name_i18n, locale);
  const translatedCompetenceDescription = getTranslatedKey(competenceData.description_i18n, locale);

  return new Competence({
    id: competenceData.id,
    name: translatedCompetenceName,
    index: competenceData.index,
    description: translatedCompetenceDescription,
    origin: competenceData.origin,
    skillIds: competenceData.skillIds,
    thematicIds: competenceData.thematicIds,
    areaId: competenceData.areaId,
  });
}

module.exports = {
  list({ locale } = { locale: FRENCH_FRANCE }) {
    return _list({ locale: locale || FRENCH_FRANCE });
  },

  async listPixCompetencesOnly({ locale } = { locale: FRENCH_FRANCE }) {
    const allCompetences = await _list({ locale });
    return allCompetences.filter((competence) => competence.origin === PIX_ORIGIN);
  },

  async get({ id, locale }) {
    try {
      const competenceData = await competenceDatasource.get(id);
      return _toDomain({ competenceData, locale });
    } catch (err) {
      if (err instanceof LearningContentResourceNotFound) {
        throw new NotFoundError('La compétence demandée n’existe pas');
      }
      throw err;
    }
  },

  async getCompetenceName({ id, locale }) {
    try {
      const competence = await competenceDatasource.get(id);
      return getTranslatedKey(competence.name_i18n, locale);
    } catch (err) {
      if (err instanceof LearningContentResourceNotFound) {
        throw new NotFoundError('La compétence demandée n’existe pas');
      }
      throw err;
    }
  },

  async findByRecordIds({ competenceIds, locale }) {
    const competenceDatas = await competenceDatasource.list();
    return competenceDatas
      .filter(({ id }) => competenceIds.includes(id))
      .map((competenceData) => _toDomain({ competenceData, locale }));
  },

  async findByAreaId({ areaId, locale }) {
    const competenceDatas = await competenceDatasource.list();
    return competenceDatas
      .filter((competenceData) => competenceData.areaId === areaId)
      .map((competenceData) => _toDomain({ competenceData, locale }));
  },
};

async function _list({ locale }) {
  const competenceDatas = await competenceDatasource.list();
  return _.sortBy(
    competenceDatas.map((competenceData) => _toDomain({ competenceData, locale })),
    'index'
  );
}
