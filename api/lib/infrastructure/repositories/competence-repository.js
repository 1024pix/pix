const _ = require('lodash');
const AirtableNotFoundError = require('../datasources/learning-content/AirtableResourceNotFound');
const Area = require('../../domain/models/Area');
const areaDatasource = require('../datasources/learning-content/area-datasource');
const Competence = require('../../domain/models/Competence');
const competenceDatasource = require('../datasources/learning-content/competence-datasource');
const knowledgeElementRepository = require('./knowledge-element-repository');
const scoringService = require('../../domain/services/scoring/scoring-service');
const { NotFoundError } = require('../../domain/errors');
const { FRENCH_FRANCE } = require('../../domain/constants').LOCALE;
const { getTranslatedText } = require('../../domain/services/get-translated-text');

const PixOriginName = 'Pix';

function _toDomain({ competenceData, areaDatas, locale }) {
  const areaData = competenceData.areaId && _.find(areaDatas, { id: competenceData.areaId });
  const translatedCompetenceName = getTranslatedText(locale, { frenchText: competenceData.nameFrFr, englishText: competenceData.nameEnUs });
  const translatedCompetenceDescription = getTranslatedText(locale, { frenchText: competenceData.descriptionFrFr, englishText: competenceData.descriptionEnUs });
  const translatedAreaTitle = areaData ? getTranslatedText(locale, { frenchText: areaData.titleFrFr, englishText: areaData.titleEnUs }) : '';

  return new Competence({
    id: competenceData.id,
    name: translatedCompetenceName,
    index: competenceData.index,
    description: translatedCompetenceDescription,
    origin: competenceData.origin,
    skillIds: competenceData.skillIds,
    area: areaData && new Area({
      id: areaData.id,
      code: areaData.code,
      title: translatedAreaTitle,
      color: areaData.color,
    }),
  });
}

module.exports = {

  list({ locale } = { locale: FRENCH_FRANCE }) {
    return _list({ locale: locale || FRENCH_FRANCE });
  },

  listPixCompetencesOnly({ locale } = { locale: FRENCH_FRANCE }) {
    return _list({ locale }).then((competences) =>
      competences.filter((competence) => competence.origin === PixOriginName),
    );
  },

  async get({ id, locale }) {
    try {
      const [competenceData, areaDatas] = await Promise.all([competenceDatasource.get(id), areaDatasource.list()]);
      return _toDomain({ competenceData, areaDatas, locale });
    } catch (err) {
      if (err instanceof AirtableNotFoundError) {
        throw new NotFoundError('La compétence demandée n’existe pas');
      }
      throw err;
    }
  },

  async getCompetenceName({ id, locale }) {
    try {
      const competence = await competenceDatasource.get(id);
      return getTranslatedText(locale, { frenchText: competence.nameFrFr, englishText: competence.nameEnUs });
    } catch (err) {
      if (err instanceof AirtableNotFoundError) {
        throw new NotFoundError('La compétence demandée n’existe pas');
      }
      throw err;
    }
  },

  async getPixScoreByCompetence({ userId, limitDate }) {
    const knowledgeElementsGroupedByCompetenceId = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({
      userId,
      limitDate,
    });

    return _.mapValues(knowledgeElementsGroupedByCompetenceId, (knowledgeElements) => {
      const {
        pixScoreForCompetence,
      } = scoringService.calculateScoringInformationForCompetence({ knowledgeElements });
      return pixScoreForCompetence;
    });
  },

};

function _list({ locale }) {
  return Promise.all([competenceDatasource.list(), areaDatasource.list()])
    .then(([competenceDatas, areaDatas]) => {
      return _.sortBy(
        competenceDatas.map((competenceData) => _toDomain({ competenceData, areaDatas, locale })),
        'index',
      );
    });
}
