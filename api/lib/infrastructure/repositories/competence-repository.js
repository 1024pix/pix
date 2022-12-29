const _ = require('lodash');
const LearningContentResourceNotFound = require('../datasources/learning-content/LearningContentResourceNotFound');
const Area = require('../../domain/models/Area');
const areaDatasource = require('../datasources/learning-content/area-datasource');
const Competence = require('../../domain/models/Competence');
const competenceDatasource = require('../datasources/learning-content/competence-datasource');
const { NotFoundError } = require('../../domain/errors');
const { FRENCH_FRANCE } = require('../../domain/constants').LOCALE;
const { PIX_ORIGIN } = require('../../domain/constants');
const { getTranslatedKey } = require('../../domain/services/get-translated-text');

function _toDomain_new({ competenceData, locale }) {
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

function _toDomain({ competenceData, areaDatas, locale }) {
  const areaData = competenceData.areaId && _.find(areaDatas, { id: competenceData.areaId });
  const translatedCompetenceName = getTranslatedKey(competenceData.name_i18n, locale);
  const translatedCompetenceDescription = getTranslatedKey(competenceData.description_i18n, locale);
  const translatedAreaTitle = areaData ? getTranslatedKey(areaData.title_i18n, locale) : '';

  return new Competence({
    id: competenceData.id,
    name: translatedCompetenceName,
    index: competenceData.index,
    description: translatedCompetenceDescription,
    origin: competenceData.origin,
    skillIds: competenceData.skillIds,
    thematicIds: competenceData.thematicIds,
    areaId: competenceData.areaId,
    area:
      areaData &&
      new Area({
        id: areaData.id,
        code: areaData.code,
        title: translatedAreaTitle,
        name: areaData.name,
        color: areaData.color,
        frameworkId: areaData.frameworkId,
      }),
  });
}

module.exports = {
  list({ locale } = { locale: FRENCH_FRANCE }) {
    return _list({ locale: locale || FRENCH_FRANCE });
  },

  listPixCompetencesOnly({ locale } = { locale: FRENCH_FRANCE }) {
    return _list({ locale }).then((competences) =>
      competences.filter((competence) => competence.origin === PIX_ORIGIN)
    );
  },

  async get({ id, locale }) {
    try {
      const [competenceData, areaDatas] = await Promise.all([competenceDatasource.get(id), areaDatasource.list()]);
      return _toDomain({ competenceData, areaDatas, locale });
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
    const [competenceDatas, areaDatas] = await Promise.all([competenceDatasource.list(), areaDatasource.list()]);
    return competenceDatas
      .filter(({ id }) => competenceIds.includes(id))
      .map((competenceData) => _toDomain({ competenceData, areaDatas, locale }));
  },

  // TODO dont forget to promote me later !
  async findByRecordIds_new({ competenceIds, locale }) {
    const competenceDatas = await competenceDatasource.list();
    return competenceDatas
      .filter(({ id }) => competenceIds.includes(id))
      .map((competenceData) => _toDomain_new({ competenceData, locale }));
  },
};

function _list({ locale }) {
  return Promise.all([competenceDatasource.list(), areaDatasource.list()]).then(([competenceDatas, areaDatas]) => {
    return _.sortBy(
      competenceDatas.map((competenceData) => _toDomain({ competenceData, areaDatas, locale })),
      'index'
    );
  });
}
