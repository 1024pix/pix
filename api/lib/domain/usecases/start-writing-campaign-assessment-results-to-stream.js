const campaignParticipationService = require('../services/campaign-participation-service');

const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');

const { UserNotAuthorizedToGetCampaignResultsError, CampaignWithoutOrganizationError } = require('../errors');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');

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

  //Create HEADER of CSV
  const headers = _createHeaderOfCSV(targetProfile.skills, competences, campaign.idPixLabel);

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
      organization,
      campaign,
      competences,
      campaignParticipationResultData,
      targetProfile,
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

function _createHeaderOfCSV(skills, competences, idPixLabel) {
  const areas = _extractAreas(competences);

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

function _makeStatsColumns(isShared) {
  return ({ skillCount, validatedSkillCount }) => {
    if (!isShared) return ['NA', 'NA', 'NA'];
    return [
      _.round(validatedSkillCount / skillCount, 2),
      skillCount,
      validatedSkillCount,
    ];
  };
}

function _getStatsForCompetence(targetProfile, knowledgeElements) {
  return (competence) => {
    const skillsForThisCompetence = _getSkillsOfCompetenceByTargetProfile(competence, targetProfile);
    return {
      skillCount: skillsForThisCompetence.length,
      validatedSkillCount: _getSkillsValidatedForCompetence(skillsForThisCompetence, knowledgeElements)
    };
  };
}

function _makeCompetenceColumns({ competences, targetProfile, knowledgeElements, isShared }) {
  return _.flatMap(competences, (competence) => _makeStatsColumns(isShared)({
    id: competence.id,
    ..._getStatsForCompetence(targetProfile, knowledgeElements)(competence),
  }));
}

function _makeAreaColumns({ competences, targetProfile, knowledgeElements, isShared }) {
  const areas = _extractAreas(competences);
  return _.flatMap(areas, ({ id }) => {
    const areaCompetenceStats = _.filter(competences, (competence) => competence.area.id === id)
      .map(_getStatsForCompetence(targetProfile, knowledgeElements));

    const skillCount = _.sumBy(areaCompetenceStats, 'skillCount');
    const validatedSkillCount = _.sumBy(areaCompetenceStats, 'validatedSkillCount');

    return _makeStatsColumns(isShared)({
      id,
      skillCount,
      validatedSkillCount,
    });
  });
}

function _makeCommonColumns({ organization, campaign, targetProfile, knowledgeElements, campaignParticipationResultData }) {
  const isShared = campaignParticipationResultData.isShared;
  const { participantFirstName, participantLastName } = campaignParticipationResultData;
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
    isShared ? 'Oui' : 'Non',
    isShared ? moment.utc(campaignParticipationResultData.sharedAt).format('YYYY-MM-DD') : 'NA',
    isShared ? _percentageSkillsValidated(knowledgeElements, targetProfile) : 'NA',
  ];
}

function _createOneLineOfCSV({
  organization,
  campaign,
  competences,
  campaignParticipationResultData,
  targetProfile,
  participantKnowledgeElements,
}) {
  const isShared = campaignParticipationResultData.isShared;
  const knowledgeElements = participantKnowledgeElements
    .filter((ke) => _.find(targetProfile.skills, { id: ke.skillId }));

  return csvSerializer.serializeLine([
    ..._makeCommonColumns({ organization, campaign, targetProfile, knowledgeElements, campaignParticipationResultData }),
    ..._makeCompetenceColumns({ competences, targetProfile, knowledgeElements, isShared }),
    ..._makeAreaColumns({ competences, targetProfile, knowledgeElements, isShared }),
    ..._.map(targetProfile.skills, ({ id }) => isShared ? _stateOfSkill(id, knowledgeElements) : 'NA')
  ]);
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

