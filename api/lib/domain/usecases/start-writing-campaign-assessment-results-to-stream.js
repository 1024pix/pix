const campaignParticipationService = require('../services/campaign-participation-service');

const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');

const { UserNotAuthorizedToGetCampaignResultsError, CampaignWithoutOrganizationError } = require('../errors');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');

async function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if (_.isNil(organizationId)) {
    throw new CampaignWithoutOrganizationError(`Campaign without organization : ${organizationId}`);
  }

  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(
      `User does not have an access to the organization ${organizationId}`
    );
  }
}

function _createHeaderOfCSV(skills, competences, areas, idPixLabel) {
  return [
    'Nom de l\'organisation',
    'ID Campagne',
    'Nom de la campagne',
    'Nom du Profil Cible',
    'Nom du Participant',
    'Prénom du Participant',

    ...(idPixLabel ? [idPixLabel] : []),

    '% de progression',
    'Date de début',
    'Partage (O/N)',
    'Date du partage',
    '% maitrise de l\'ensemble des acquis du profil',

    ...(_.flatMap(competences, (competence) => [
      `% de maitrise des acquis de la compétence ${competence.name}`,
      `Nombre d'acquis du profil cible dans la compétence ${competence.name}`,
      `Acquis maitrisés dans la compétence ${competence.name}`,
    ])),

    ...(_.flatMap(areas, (area) => [
      `% de maitrise des acquis du domaine ${area.title}`,
      `Nombre d'acquis du profil cible du domaine ${area.title}`,
      `Acquis maitrisés du domaine ${area.title}`,
    ])),

    ...(_.map(skills, 'name')),
  ];
}

function _totalValidatedSkills(knowledgeElements) {
  const sumValidatedSkills = _.reduce(knowledgeElements, function(validatedSkill, knowledgeElement) {
    if (knowledgeElement.isValidated) {
      return validatedSkill + 1;
    }
    return validatedSkill;
  }, 0);
  return sumValidatedSkills;
}

function _percentageSkillsValidated(knowledgeElements, targetProfile) {
  return _.round(_totalValidatedSkills(knowledgeElements) / targetProfile.skills.length, 2);
}

function _stateOfSkill(skillId, knowledgeElements) {
  const knowledgeElementForSkill = _.findLast(knowledgeElements,
    (knowledgeElement) => knowledgeElement.skillId === skillId);
  if (knowledgeElementForSkill) {
    return knowledgeElementForSkill.isValidated ? 'OK' : 'KO';
  } else {
    return 'Non testé';
  }
}

function _getSkillsOfCompetenceByTargetProfile(competence, targetProfile) {
  const skillsOfProfile = targetProfile.skills;
  const skillsOfCompetences = competence.skillIds;
  return skillsOfProfile
    .filter((skillOfProfile) => skillsOfCompetences.some((skill) => skill === skillOfProfile.id));
}

function _getSkillsValidatedForCompetence(skills, knowledgeElements) {
  const sumValidatedSkills = _.reduce(knowledgeElements, function(validatedSkill, knowledgeElement) {
    if (knowledgeElement.isValidated && skills.find((skill) => skill.id === knowledgeElement.skillId)) {
      return validatedSkill + 1;
    }
    return validatedSkill;
  }, 0);
  return sumValidatedSkills;

}

function _getCommonColumns({
  organization,
  campaign,
  targetProfile,
  participantFirstName,
  participantLastName,
  campaignParticipationResultData,
  knowledgeElements,
}) {

  return [
    organization.name,
    campaign.id,
    campaign.name,
    targetProfile.name,
    participantLastName,
    participantFirstName,
    campaign.idPixLabel ? campaignParticipationResultData.participantExternalId : 'NA',
    campaignParticipationService.progress(campaignParticipationResultData.isCompleted, knowledgeElements.length, targetProfile.skills.length),
    moment.utc(campaignParticipationResultData.createdAt).format('YYYY-MM-DD'),
    campaignParticipationResultData.isShared ? 'Oui' : 'Non',
  ];
}

function _getSharedColumns({
  competences,
  targetProfile,
  areas,
  campaignParticipationResultData,
  knowledgeElements,
}) {
  const competenceStats = _.map(competences, (competence) => {
    const skillsForThisCompetence = _getSkillsOfCompetenceByTargetProfile(competence, targetProfile);
    const skillCount = skillsForThisCompetence.length;
    const validatedSkillCount = _getSkillsValidatedForCompetence(skillsForThisCompetence, knowledgeElements);

    return {
      id: competence.id,
      areaId: competence.area.id,
      skillCount,
      validatedSkillCount,
    };
  });

  const areaStats = _.map(areas, ({ id }) => {
    const areaCompetenceStats = _.filter(competenceStats, { areaId: id });
    const skillCount = _.sumBy(areaCompetenceStats, 'skillCount');
    const validatedSkillCount = _.sumBy(areaCompetenceStats, 'validatedSkillCount');

    return {
      id,
      skillCount,
      validatedSkillCount,
    };
  });

  const lineMap = [
    moment.utc(campaignParticipationResultData.sharedAt).format('YYYY-MM-DD'),
    _percentageSkillsValidated(knowledgeElements, targetProfile),
  ];

  const addStatsColumns = () => ({ skillCount, validatedSkillCount }) => {
    lineMap.push(_.round(validatedSkillCount / skillCount, 2));
    lineMap.push(skillCount);
    lineMap.push(validatedSkillCount);
  };

  _.forEach(competenceStats, addStatsColumns());
  _.forEach(areaStats, addStatsColumns());

  _.forEach(targetProfile.skills, ({ id }) => {
    lineMap.push(_stateOfSkill(id, knowledgeElements));
  });

  return lineMap;
}

function _createOneLineOfCSV({
  headers,
  organization,
  campaign,
  competences,
  areas,
  campaignParticipationResultData,
  targetProfile,

  participantFirstName,
  participantLastName,
  participantKnowledgeElements,
}) {
  const knowledgeElements = participantKnowledgeElements
    .filter((ke) => _.find(targetProfile.skills, { id: ke.skillId }));

  let lineMap = _getCommonColumns({
    organization,
    campaign,
    targetProfile,
    participantFirstName,
    participantLastName,
    campaignParticipationResultData,
    knowledgeElements,
  });

  if (campaignParticipationResultData.isShared) {
    lineMap = _.concat(lineMap, _getSharedColumns({
      competences,
      targetProfile,
      areas,
      campaignParticipationResultData,
      knowledgeElements,
    }));
  } else {
    const columnsWithNA = headers.length - lineMap.length;
    lineMap = _.concat(lineMap, Array(columnsWithNA).fill('NA'));
  }

  return csvSerializer.serializeLine(lineMap);
}

function _extractCompetences(allCompetences, skills) {
  return _(skills)
    .map('competenceId')
    .uniq()
    .map((competenceId) => {
      const competence = _.find(allCompetences, { id: competenceId });
      if (!competence) {
        throw new Error(`Unknown competence ${competenceId}`);
      }
      return competence;
    })
    .value();
}

function _extractAreas(competences) {
  return _.uniqBy(competences.map((competence) => competence.area), 'code');
}

module.exports = async function startWritingCampaignAssessmentResultsToStream(
  {
    userId,
    campaignId,
    writableStream,
    campaignRepository,
    userRepository,
    targetProfileRepository,
    competenceRepository,
    campaignParticipationRepository,
    organizationRepository,
    knowledgeElementRepository,
  }) {

  const campaign = await campaignRepository.get(campaignId);

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  const [targetProfile, allCompetences, organization, campaignParticipationResultDatas] = await Promise.all([
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findAssessmentResultDataByCampaignId(campaign.id),
  ]);

  const competences = _extractCompetences(allCompetences, targetProfile.skills);

  const areas = _extractAreas(competences);

  //Create HEADER of CSV
  const headers = _createHeaderOfCSV(targetProfile.skills, competences, areas, campaign.idPixLabel);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + csvSerializer.serializeLine(headers);

  writableStream.write(headerLine);

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the mapSeries
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  bluebird.mapSeries(campaignParticipationResultDatas, async (campaignParticipationResultData) => {
    const participantKnowledgeElements = await knowledgeElementRepository.findUniqByUserId({
      userId: campaignParticipationResultData.userId,
      limitDate: campaignParticipationResultData.sharedAt,
    });

    const csvLine = _createOneLineOfCSV({
      headers,
      organization,
      campaign,
      competences,
      areas,
      campaignParticipationResultData,
      targetProfile,

      participantFirstName: campaignParticipationResultData.participantFirstName,
      participantLastName: campaignParticipationResultData.participantLastName,
      participantKnowledgeElements,
    });

    writableStream.write(csvLine);
  }).then(() => {
    writableStream.end();
  }).catch((error) => {
    writableStream.emit('error', error);
    throw error;
  });

  const fileName = `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;
  return { fileName };
};
