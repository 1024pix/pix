const CampaignIndividualResult = require('../models/CampaignIndividualResult');
const moment = require('moment');
const bluebird = require('bluebird');
const csvService = require('../services/csv-service');
const _ = require('lodash');

const PLACEHOLDER = 'NA';

const {
  UserNotAuthorizedToGetCampaignResultsError,
  CampaignWithoutOrganizationError
} = require('../errors');

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

async function _fetchUserIfHeHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if (_.isNil(organizationId)) {
    throw new CampaignWithoutOrganizationError(`Campaign without organization : ${organizationId}`);
  }
  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(`User does not have an access to the organization ${organizationId}`);
  }
  return user;
}

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

module.exports = async function startWritingCampaignResultsToStream({
  userId,
  campaignId,
  writableStream,
  campaignRepository,
  userRepository,
  targetProfileRepository,
  competenceRepository,
  campaignParticipationRepository,
  organizationRepository,
  smartPlacementAssessmentRepository,
  knowledgeElementRepository,
}) {

  const campaign = await campaignRepository.get(campaignId);

  const [user, targetProfile, competences, organization, campaignParticipations] = await Promise.all([
    _fetchUserIfHeHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository),
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findByCampaignId(campaign.id),
  ]);

  const campaignIndividualResult = CampaignIndividualResult.buildFrom({
    campaign, user, targetProfile, competences, organization,
  });
  
  let dynamicHeadersPropertyMap = _.cloneDeep(headerPropertyMap);

  if (campaign.idPixLabel) {
    dynamicHeadersPropertyMap = csvService.insert(headerPropertyMapIdPixLabel(campaign))
      .into(dynamicHeadersPropertyMap)
      .after('Prénom du Participant');
  }

  const headers = createCsvHeader(campaignIndividualResult.targeted, campaign.idPixLabel);
  writableStream.write(csvService.getHeaderLine(headers));

  bluebird.mapSeries(campaignParticipations, async (campaignParticipation) => {

    const [assessment, allKnowledgeElements] = await Promise.all([
      smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId),
      knowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId, limitDate: campaignParticipation.sharedAt })
    ]);

    if (!campaignParticipation.isShared) {
      campaignIndividualResult.addIndividualStatistics({ assessment, campaignParticipation, allKnowledgeElements });
      const line = csvService.getCsvLine({ rawData: campaignIndividualResult, headers, headerPropertyMap: dynamicHeadersPropertyMap, placeholder: PLACEHOLDER });
      return writableStream.write(line);

    } else {
      campaignIndividualResult.addIndividualStatisticsWhenShared({ assessment, campaignParticipation, allKnowledgeElements });
      dynamicHeadersPropertyMap = _getDynamicHeadersPropertyMapForSharedCampaign(dynamicHeadersPropertyMap, campaignIndividualResult.targeted);
      const line = csvService.getCsvLine({ rawData: campaignIndividualResult, headers, headerPropertyMap: dynamicHeadersPropertyMap, placeholder: PLACEHOLDER });
      return writableStream.write(line);
    }

  }).then(() => {
    writableStream.end();
  }).catch((error) => {
    writableStream.emit('error', error);
    throw error;
  });

  const fileName = `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;
  return { fileName };
};

function _getDynamicHeadersPropertyMapForSharedCampaign(dynamicHeadersPropertyMap, targeted) {
  return [
    ...dynamicHeadersPropertyMap,
    ...headerPropertyMapForSharedCampaign,
    ...headerPropertyMapForCompetences(targeted),
    ...headerPropertyMapForAreas(targeted),
    ...headerPropertyMapForSkills(targeted),
  ];
}
