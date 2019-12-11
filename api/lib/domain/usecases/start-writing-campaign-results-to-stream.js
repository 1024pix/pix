const moment = require('moment');
const bluebird = require('bluebird');
const csvService = require('../services/csv-service');
const { assign: addProperties } = require('lodash/fp');
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
  return _.flatMap(skills, (skill) => [
    { headerName: skill.name, value: _stateOfSkill(skill.id, knowledgeElements) }
  ]);
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

function _stateOfSkill(skillId, knowledgeElements) {
  const knowledgeElementForSkill = _.find(knowledgeElements, { skillId });
  if (knowledgeElementForSkill) {
    return knowledgeElementForSkill.isValidated ? 'OK' : 'KO';
  } else {
    return 'Non testé';
  }
}

function _getValidatedSkillsForCompetence(competenceSkills, knowledgeElements) {
  return _(knowledgeElements)
    .filter('isValidated')
    .filter(_knowledgeElementRelatedTo(competenceSkills))
    .size();
}

function _knowledgeElementRelatedTo(skills) {
  return (knowledgeElement) => _(skills).map('id').includes(knowledgeElement.skillId);
}

function _competenceRelatedTo(skillIds) {
  return (competence) => skillIds.some((skillId) => competence.skills.includes(skillId));
}

function enhanceTargetProfileCompetencesAndAreas(enhancedTargetProfile) {
  return _.each(enhancedTargetProfile.competences, (competence) => {
    const skillsForThisCompetence = enhancedTargetProfile.getSkillsInCompetence(competence);
    const numberOfSkillsValidatedForThisCompetence = _getValidatedSkillsForCompetence(skillsForThisCompetence, enhancedTargetProfile.knowledgeElements);

    competence.skillsForThisCompetence = enhancedTargetProfile.getSkillsInCompetence(competence);
    competence.numberOfSkillsValidatedForThisCompetence = numberOfSkillsValidatedForThisCompetence;
    competence.percentage = _.round(competence.numberOfSkillsValidatedForThisCompetence / skillsForThisCompetence.length, 2);

    const areaForThisCompetence = enhancedTargetProfile.areas.find((area) => area.title === competence.area.title);
    areaForThisCompetence.numberSkillsValidated += numberOfSkillsValidatedForThisCompetence;
    areaForThisCompetence.numberSkillsTested = areaForThisCompetence.numberSkillsTested + skillsForThisCompetence.length;
  });
}

function enhanceTargetProfile(targetProfile, competences) {
  const enhancedTargetProfile = _.assign(targetProfile, {
    skillNames: _.map(targetProfile.skills, 'name'),
    skillIds: _.map(targetProfile.skills, 'id'),
  });
  enhancedTargetProfile.competences = competences.filter(_competenceRelatedTo(enhancedTargetProfile.skillIds));
  enhancedTargetProfile.areas = _(enhancedTargetProfile.competences).map('area').map(addProperties({ numberSkillsValidated: 0, numberSkillsTested: 0 })).value();
  return enhancedTargetProfile;
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

  const enhancedTargetProfile = enhanceTargetProfile(targetProfile, competences);
  
  let dynamicHeadersPropertyMap = _.cloneDeep(headerPropertyMap);

  if (campaign.idPixLabel) {
    dynamicHeadersPropertyMap = csvService.insert(headerPropertyMapIdPixLabel(campaign))
      .into(dynamicHeadersPropertyMap)
      .after('Prénom du Participant');
  }

  const headers = createCsvHeader(enhancedTargetProfile, campaign.idPixLabel);
  writableStream.write(csvService.getHeaderLine(headers));

  bluebird.mapSeries(campaignParticipations, async (campaignParticipation) => {

    const [assessment, allKnowledgeElements] = await Promise.all([
      smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId),
      knowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId, limitDate: campaignParticipation.sharedAt })
    ]);

    enhancedTargetProfile.knowledgeElements = allKnowledgeElements.filter(_knowledgeElementRelatedTo(targetProfile.skills));
    enhanceTargetProfileCompetencesAndAreas(enhancedTargetProfile);

    let line;
    if (campaignParticipation.isShared) {
      const rawData = _extractRawDataForSharedCampaign({ user, organization, assessment, campaign, campaignParticipation, enhancedTargetProfile, allKnowledgeElements });
      dynamicHeadersPropertyMap = _getDynamicHeadersPropertyMapForSharedCampaign(dynamicHeadersPropertyMap, enhancedTargetProfile);
      line = csvService.getCsvLine({ rawData, headers, headerPropertyMap: dynamicHeadersPropertyMap, placeholder: PLACEHOLDER });
    } else {
      const rawData = _extractRawData({ user, organization, assessment, campaign, campaignParticipation, enhancedTargetProfile, allKnowledgeElements });
      line = csvService.getCsvLine({ rawData, headers, headerPropertyMap: dynamicHeadersPropertyMap, placeholder: PLACEHOLDER });
    }

    writableStream.write(line);
  }).then(() => {
    writableStream.end();
  }).catch((error) => {
    writableStream.emit('error', error);
    throw error;
  });

  const fileName = `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;
  return { fileName };
};

function _extractRawData({ user, organization, assessment, campaign, campaignParticipation, enhancedTargetProfile, allKnowledgeElements }) {
  return {
    organizationName: organization.name,
    campaignId: campaign.id,
    campaignName: campaign.name,
    targetProfileName: enhancedTargetProfile.name,
    userFirstName: user.firstName,
    userLastName: user.lastName,
    campaignLabel: campaignParticipation.participantExternalId,
    progression: assessment.isCompleted ? 1 : enhancedTargetProfile.getProgression(allKnowledgeElements),
    startedAt: moment.utc(assessment.createdAt).format('YYYY-MM-DD'),
    isShared: campaignParticipation.isShared ? 'Oui' : 'Non',
  };
}
/* eslint-disable no-unused-vars */
function _extractRawDataForSharedCampaign({ user, organization, assessment, campaign, campaignParticipation, enhancedTargetProfile, allKnowledgeElements }) {
  const rawData = _extractRawData(...arguments);
  rawData.sharedAt = moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD');
  rawData.knowledgeElementsValidatedPercentage = enhancedTargetProfile.getKnowledgeElementsValidatedPercentage(enhancedTargetProfile.knowledgeElements);
  return rawData;
}

function _getDynamicHeadersPropertyMapForSharedCampaign(dynamicHeadersPropertyMap, enhancedTargetProfile) {
  return [
    ...dynamicHeadersPropertyMap,
    ...headerPropertyMapForSharedCampaign,
    ...headerPropertyMapForCompetences(enhancedTargetProfile),
    ...headerPropertyMapForAreas(enhancedTargetProfile),
    ...headerPropertyMapForSkills(enhancedTargetProfile),
  ];
}
