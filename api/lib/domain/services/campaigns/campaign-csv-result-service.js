const moment = require('moment');
const csvService = require('../csv-service');
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
  { headerName: 'Nom de l\'organisation', propertyName: 'organizationName' },
  { headerName: 'ID Campagne', propertyName: 'campaignId', type: csvService.valueTypes.NUMBER },
  { headerName: 'Nom de la campagne', propertyName: 'campaignName' },
  { headerName: 'Nom du Profil Cible', propertyName: 'targetProfileName' },
  { headerName: 'Nom du Participant', propertyName: 'userLastName' },
  { headerName: 'Prénom du Participant', propertyName: 'userFirstName' },
  { headerName: '% de progression', propertyName: 'progression', type: csvService.valueTypes.NUMBER },
  { headerName: 'Date de début', propertyName: 'startedAt', type: csvService.valueTypes.NUMBER },
  { headerName: 'Partage (O/N)', propertyName: 'isShared' },
];

function getHeaderPropertyMap(campaign) {
  let dynamicHeadersPropertyMap =  _.cloneDeep(_headerPropertyMap);
  if (campaign.idPixLabel) {
    const headerMapItem = { headerName: campaign.idPixLabel, propertyName: 'campaignLabel' };
    dynamicHeadersPropertyMap = _insertItem(headerMapItem)
      .intoArray(dynamicHeadersPropertyMap)
      .afterElement('Prénom du Participant');
  }
  return dynamicHeadersPropertyMap;
}

function getHeaderPropertyMapWhenShared(campaign, { competences, areas, skills, knowledgeElements }) {
  return _.flatMap([
    getHeaderPropertyMap(campaign),
    { headerName: 'Date du partage', propertyName: 'sharedAt', type: csvService.valueTypes.NUMBER },
    { headerName: '% maitrise de l\'ensemble des acquis du profil', propertyName: 'knowledgeElementsValidatedPercentage', type: csvService.valueTypes.NUMBER },
    _.flatMap(competences, (competence) => [
      { headerName: `% de maitrise des acquis de la compétence ${competence.name}`, value: competence.percentage, type: csvService.valueTypes.NUMBER },
      { headerName: `Nombre d'acquis du profil cible dans la compétence ${competence.name}`, value: competence.skillsForThisCompetence.length, type: csvService.valueTypes.NUMBER },
      { headerName: `Acquis maitrisés dans la compétence ${competence.name}`, value: competence.numberOfSkillsValidatedForThisCompetence, type: csvService.valueTypes.NUMBER },
    ]),
    _.flatMap(areas, (area) => [
      { headerName: `% de maitrise des acquis du domaine ${area.title}`, value:_.round(area.numberSkillsValidated / area.numberSkillsTested, 2), type: csvService.valueTypes.NUMBER },
      { headerName: `Nombre d'acquis du profil cible du domaine ${area.title}`, value: area.numberSkillsTested, type: csvService.valueTypes.NUMBER },
      { headerName: `Acquis maitrisés du domaine ${area.title}`, value: area.numberSkillsValidated, type: csvService.valueTypes.NUMBER },
    ]),
    _.flatMap(skills, (skill) => {
      const knowledgeElementForSkill = _.find(knowledgeElements, { skillId: skill.id });
      const value = !knowledgeElementForSkill ? 'Non testé' : knowledgeElementForSkill.isValidated ? 'OK' : 'KO';
      return { headerName: skill.name, value };
    })
  ]);
}

const fileName = (campaign) =>  `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;

const _insertItem = (item) => {
  return {
    intoArray: (array) => {
      return {
        afterElement: (header) => {
          const idx = _.findIndex(array, { headerName: header });
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
  fileName,
  getHeaderPropertyMap,
  getHeaderPropertyMapWhenShared,
  createCsvHeader,
};
