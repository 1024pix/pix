const _ = require('lodash');
const { keys } = require('../../domain/models/Badge');
const AirtableNotFoundError = require('../../infrastructure/datasources/airtable/AirtableResourceNotFound');
const Area = require('../../domain/models/Area');
const areaDatasource = require('../datasources/airtable/area-datasource');
const Competence = require('../../domain/models/Competence');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const badgeRepository = require('./badge-repository');
const knowledgeElementRepository = require('./knowledge-element-repository');
const scoringService = require('../../domain/services/scoring/scoring-service');
const skillRepository = require('./skill-repository');
const { NotFoundError } = require('../../domain/errors');

const PixOriginName = 'Pix';

function _toDomain(competenceData, areaDatas) {
  const areaData = competenceData.areaId && _.find(areaDatas, { id: competenceData.areaId });
  return new Competence({
    id: competenceData.id,
    name: competenceData.name,
    index: competenceData.index,
    description: competenceData.description,
    origin: competenceData.origin,
    skillIds: competenceData.skillIds,
    area: areaData && new Area({
      id: areaData.id,
      code: areaData.code,
      title: areaData.titleFrFr,
      color: areaData.color,
    }),
  });
}

module.exports = {

  list() {
    return _list();
  },

  listPixCompetencesOnly() {

    return _list().then((competences) =>
      competences.filter((competence) => competence.origin === PixOriginName)
    );
  },

  async get(id) {
    try {
      const [competenceData, areaDatas] = await Promise.all([competenceDatasource.get(id), areaDatasource.list()]);
      return _toDomain(competenceData, areaDatas);
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

  async getTotalPixCleaByCompetence() {
    const badgeClea = await badgeRepository.findOneByKey(keys.PIX_EMPLOI_CLEA);
    const cleaSkillIds = badgeClea.badgePartnerCompetences.flatMap((b) => b.skillIds);
    const cleaSkills =  await skillRepository.findByIds(cleaSkillIds);
    const competencesIds = _(cleaSkills).map((s) => s.competenceId).uniq().value();
    return  _.zipObject(competencesIds, competencesIds.map((id) => _getSumPixValue(cleaSkills, id)));
  }

};

function _list() {
  return Promise.all([competenceDatasource.list(), areaDatasource.list()])
    .then(([competenceDatas, areaDatas]) => {
      return _.sortBy(
        competenceDatas.map((competenceData) => _toDomain(competenceData, areaDatas)),
        'index'
      );
    });
}

function _getSumPixValue(cleaSkills, id) {
  return _(cleaSkills)
    .filter((skill) => skill.competenceId === id)
    .reduce((cumulatedPixValue, skill) => cumulatedPixValue + skill.pixValue, 0);
}

