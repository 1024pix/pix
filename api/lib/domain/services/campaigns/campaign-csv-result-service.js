const moment = require('moment');
const csvUtils = require('../../../infrastructure/utils/csv-utils');
const _ = require('lodash');

const CAMPAIGN_CSV_PLACEHOLDER = 'NA';

function createCsvHeader(campaign, { competences, areas, skillNames }) {
  return _([
    'Nom de l\'organisation',
    'ID Campagne',
    'Nom de la campagne',
    'Nom du Profil Cible',
    'Nom du Participant',
    'Prénom du Participant',
    campaign.idPixLabel ? campaign.idPixLabel : null,
    '% de progression',
    'Date de début',
    'Partage (O/N)',
    'Date du partage',
    '% maitrise de l\'ensemble des acquis du profil',
    _.flatMap(competences, (competence) => [
      `% de maitrise des acquis de la compétence ${competence.name}`,
      `Nombre d'acquis du profil cible dans la compétence ${competence.name}`,
      `Acquis maitrisés dans la compétence ${competence.name}`,
    ]),
    _.flatMap(areas, (area) => [
      `% de maitrise des acquis du domaine ${area.title}`,
      `Nombre d'acquis du profil cible du domaine ${area.title}`,
      `Acquis maitrisés du domaine ${area.title}`,
    ]),
    _.map(skillNames, (skillName) => `${skillName}`),
  ]).flatMap().compact().value();
}

const _headerPropertyMap = [
  { propertyName: 'organizationName' },
  { propertyName: 'campaignId', type: csvUtils.valueTypes.NUMBER },
  { propertyName: 'campaignName' },
  { propertyName: 'targetProfileName' },
  { propertyName: 'userLastName' },
  { propertyName: 'userFirstName' },
  { propertyName: 'progression', type: csvUtils.valueTypes.NUMBER },
  { propertyName: 'startedAt', type: csvUtils.valueTypes.NUMBER },
  { propertyName: 'isShared' },
];

function getHeaderPropertyMap(campaign) {
  let dynamicHeadersPropertyMap =  _.cloneDeep(_headerPropertyMap);
  if (campaign.idPixLabel) {
    const headerMapItem = { headerName: campaign.idPixLabel, propertyName: 'campaignLabel' };
    dynamicHeadersPropertyMap = _insertItem(headerMapItem)
      .intoArray(dynamicHeadersPropertyMap)
      .afterProperty('userFirstName');
  }
  return dynamicHeadersPropertyMap;
}

function getHeaderPropertyMapWhenShared(campaign, { competences, areas, skills, knowledgeElements }) {
  return _.flatMap([
    getHeaderPropertyMap(campaign),
    { propertyName: 'sharedAt', type: csvUtils.valueTypes.NUMBER },
    { propertyName: 'knowledgeElementsValidatedPercentage', type: csvUtils.valueTypes.NUMBER },
    _.flatMap(competences, (competence) => [
      { value: competence.percentage, type: csvUtils.valueTypes.NUMBER },
      { value: competence.skillsForThisCompetence.length, type: csvUtils.valueTypes.NUMBER },
      { value: competence.numberOfSkillsValidatedForThisCompetence, type: csvUtils.valueTypes.NUMBER },
    ]),
    _.flatMap(areas, (area) => [
      { value:_.round(area.numberSkillsValidated / area.numberSkillsTested, 2), type: csvUtils.valueTypes.NUMBER },
      { value: area.numberSkillsTested, type: csvUtils.valueTypes.NUMBER },
      { value: area.numberSkillsValidated, type: csvUtils.valueTypes.NUMBER },
    ]),
    _.flatMap(skills, (skill) => {
      const knowledgeElementForSkill = _.find(knowledgeElements, { skillId: skill.id });
      const value = !knowledgeElementForSkill ? 'Non testé' : knowledgeElementForSkill.isValidated ? 'OK' : 'KO';
      return { headerName: skill.name, value };
    })
  ]);
}

const makeCSVResultFileName = (campaign) =>  `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;

const _insertItem = (item) => {
  return {
    intoArray: (array) => {
      return {
        afterProperty: (propertyName) => {
          const idx = _.findIndex(array, { propertyName });
          const firstSlice = _.slice(array, 0, idx + 1);
          const secondSlice = _.slice(array, idx + 1);
          return _.concat(firstSlice, item, secondSlice);
        }
      };
    }
  };
};

module.exports = {
  CAMPAIGN_CSV_PLACEHOLDER,
  makeCSVResultFileName,
  getHeaderPropertyMap,
  getHeaderPropertyMapWhenShared,
  createCsvHeader,
};
