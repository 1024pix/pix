const moment = require('moment');
const csvService = require('../csv-service');
const _ = require('lodash');

function createCsvHeader({ competences, areas, skillNames }, idPixLabel) {
  return _([
    'Nom de l\'organisation',
    'ID Campagne',
    'Nom de la campagne',
    'Nom du Profil Cible',
    'Nom du Participant',
    'Prénom du Participant',
    idPixLabel ? idPixLabel : null,
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

const CAMPAIGN_CSV_PLACEHOLDER = 'NA';

const headerPropertyMap = [
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

const headerPropertyMapIdPixLabel = (campaign) => {
  return { headerName: campaign.idPixLabel, propertyName: 'campaignLabel' };
};

const headerPropertyMapForSharedCampaign = [
  { headerName: 'Date du partage', propertyName: 'sharedAt', type: csvService.valueTypes.NUMBER },
  { headerName: '% maitrise de l\'ensemble des acquis du profil', propertyName: 'knowledgeElementsValidatedPercentage', type: csvService.valueTypes.NUMBER },
];

function headerPropertyMapForCompetences({ competences }) {
  return _.flatMap(competences, (competence) => [
    { headerName: `% de maitrise des acquis de la compétence ${competence.name}`, value: competence.percentage, type: csvService.valueTypes.NUMBER },
    { headerName: `Nombre d'acquis du profil cible dans la compétence ${competence.name}`, value: competence.skillsForThisCompetence.length, type: csvService.valueTypes.NUMBER },
    { headerName: `Acquis maitrisés dans la compétence ${competence.name}`, value: competence.numberOfSkillsValidatedForThisCompetence, type: csvService.valueTypes.NUMBER },
  ]);
}

function headerPropertyMapForAreas({ areas }) {
  return _.flatMap(areas, (area) => [
    { headerName: `% de maitrise des acquis du domaine ${area.title}`, value:_.round(area.numberSkillsValidated / area.numberSkillsTested, 2), type: csvService.valueTypes.NUMBER },
    { headerName: `Nombre d'acquis du profil cible du domaine ${area.title}`, value: area.numberSkillsTested, type: csvService.valueTypes.NUMBER },
    { headerName: `Acquis maitrisés du domaine ${area.title}`, value: area.numberSkillsValidated, type: csvService.valueTypes.NUMBER },
  ]);
}

function headerPropertyMapForSkills({ skills, knowledgeElements }) {
  return _.flatMap(skills, (skill) => {
    const knowledgeElementForSkill = _.find(knowledgeElements, { skillId: skill.id });
    const value = !knowledgeElementForSkill ? 'Non testé' : knowledgeElementForSkill.isValidated ? 'OK' : 'KO';
    return { headerName: skill.name, value };
  });
}

function getHeadersPropertyMap(campaign) {
  let dynamicHeadersPropertyMap =  _.cloneDeep(headerPropertyMap);
  if (campaign.idPixLabel) {
    dynamicHeadersPropertyMap = csvService.insert(headerPropertyMapIdPixLabel(campaign))
      .into(dynamicHeadersPropertyMap)
      .after('Prénom du Participant');
  }
  return dynamicHeadersPropertyMap;
}

function getHeadersPropertyMapWhenShared(campaign, targeted) {
  return [
    ...getHeadersPropertyMap(campaign),
    ...headerPropertyMapForSharedCampaign,
    ...headerPropertyMapForCompetences(targeted),
    ...headerPropertyMapForAreas(targeted),
    ...headerPropertyMapForSkills(targeted),
  ];
}

const fileName = (campaign) =>  `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;

module.exports = {
  CAMPAIGN_CSV_PLACEHOLDER,
  fileName,
  headerPropertyMap,
  getHeadersPropertyMap,
  getHeadersPropertyMapWhenShared,
  createCsvHeader,
};
