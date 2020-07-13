const _ = require('lodash');
const AirtableNotFoundError = require('../../infrastructure/datasources/airtable/AirtableResourceNotFound');
const Area = require('../../domain/models/Area');
const areaDatasource = require('../datasources/airtable/area-datasource');
const Competence = require('../../domain/models/Competence');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const knowledgeElementRepository = require('./knowledge-element-repository');
const scoringService = require('../../domain/services/scoring/scoring-service');
const { NotFoundError } = require('../../domain/errors');
const { FRENCH_FRANCE, ENGLISH_SPOKEN } = require('../../domain/constants').LOCALE;

const PixOriginName = 'Pix';

function _toDomain(competenceData, areaDatas, locale) {
  const areaData = competenceData.areaId && _.find(areaDatas, { id: competenceData.areaId });
  return new Competence({
    id: competenceData.id,
    name: _getTranslatedText(locale, competenceData.nameFrFr, competenceData.nameEnUs),
    index: competenceData.index,
    description: _getTranslatedText(locale, competenceData.descriptionFrFr, competenceData.descriptionEnUs),
    origin: competenceData.origin,
    skillIds: competenceData.skillIds,
    area: areaData && new Area({
      id: areaData.id,
      code: areaData.code,
      title: _getTranslatedText(locale, areaData.titleFrFr, areaData.titleEnUs),
      color: areaData.color,
    }),
  });
}

function _getTranslatedText(locale, frenchText, englishText) {
  if (locale === ENGLISH_SPOKEN) {
    return englishText;
  }

  return frenchText;
}

module.exports = {

  list(locale) {
    return _list({ locale: locale || FRENCH_FRANCE });
  },

  listPixCompetencesOnly({ locale } = { locale: FRENCH_FRANCE }) {

    return _list({ locale }).then((competences) =>
      competences.filter((competence) => competence.origin === PixOriginName)
    );
  },

  async get(id, locale) {
    try {
      const [competenceData, areaDatas] = await Promise.all([competenceDatasource.get(id), areaDatasource.list()]);
      return _toDomain(competenceData, areaDatas, locale);
    } catch (err) {
      if (err instanceof AirtableNotFoundError) {
        throw new NotFoundError('La compétence demandée n’existe pas');
      }
      throw err;
    }
  },

  getCompetenceName(id) {
    return competenceDatasource.get(id)
      .then((competence) => {
        return competence.name;
      })
      .catch(() => {
        throw new NotFoundError('La compétence demandée n’existe pas');
      });
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
        competenceDatas.map((competenceData) => _toDomain(competenceData, areaDatas, locale)),
        'index'
      );
    });
}
