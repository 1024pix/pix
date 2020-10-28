const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');

const constants = require('../../infrastructure/constants');
const { UserNotAuthorizedToGetCampaignResultsError } = require('../errors');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');

module.exports = async function startWritingCampaignAssessmentResultsToStream(
  {
    userId,
    campaignId,
    writableStream,
    campaignRepository,
    userRepository,
    targetProfileWithLearningContentRepository,
    campaignParticipationInfoRepository,
    organizationRepository,
    knowledgeElementRepository,
    badgeAcquisitionRepository,
    stageRepository,
    campaignCsvExportService,
  }) {

  const campaign = await campaignRepository.get(campaignId);

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  const targetProfile = await targetProfileWithLearningContentRepository.getWithBadges({ id: campaign.targetProfileId });
  const organization = await organizationRepository.get(campaign.organizationId);
  const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaign.id);
  const stages = await stageRepository.findByCampaignId(campaign.id);

  // Create HEADER of CSV
  const reachableStages = stages.filter(({ threshold }) => threshold > 0);

  const headers = _createHeaderOfCSV(targetProfile, campaign.idPixLabel, organization.type, organization.isManagingStudents, reachableStages);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + csvSerializer.serializeLine(headers);

  writableStream.write(headerLine);

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the map
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  const campaignParticipationInfoChunks = _.chunk(campaignParticipationInfos, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
  bluebird.map(campaignParticipationInfoChunks, async (campaignParticipationInfoChunk) => {
    const userIdsAndDates = Object.fromEntries(campaignParticipationInfoChunk.map((campaignParticipationInfo) => {
      return [
        campaignParticipationInfo.userId,
        campaignParticipationInfo.sharedAt,
      ];
    }));
    const knowledgeElementsByUserIdAndCompetenceId =
      await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers(userIdsAndDates, targetProfile);

    let acquiredBadgesByUsers;
    if (!_.isEmpty(targetProfile.badges)) {
      const userIds = campaignParticipationInfoChunk.map((campaignParticipationInfo) => campaignParticipationInfo.userId);
      acquiredBadgesByUsers = await badgeAcquisitionRepository.getCampaignAcquiredBadgesByUsers({ campaignId, userIds });
    }

    let csvLines = '';
    for (const [strParticipantId, participantKnowledgeElementsByCompetenceId] of Object.entries(knowledgeElementsByUserIdAndCompetenceId)) {
      const participantId = parseInt(strParticipantId);
      const campaignParticipationInfo = campaignParticipationInfoChunk.find((campaignParticipationInfo) => campaignParticipationInfo.userId === participantId);
      const acquiredBadges = acquiredBadgesByUsers && acquiredBadgesByUsers[participantId] ? acquiredBadgesByUsers[participantId].map((badge) => badge.title) : [];
      const csvLine = campaignCsvExportService.createOneCsvLine({
        organization,
        campaign,
        campaignParticipationInfo,
        targetProfile,
        participantKnowledgeElementsByCompetenceId,
        stages: reachableStages,
        acquiredBadges,
      });
      csvLines = csvLines.concat(csvLine);
    }

    writableStream.write(csvLines);
  }, { concurrency: constants.CONCURRENCY_HEAVY_OPERATIONS }).then(() => {
    writableStream.end();
  }).catch((error) => {
    writableStream.emit('error', error);
    throw error;
  });

  const fileName = `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;
  return { fileName };
};

async function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(
      `User does not have an access to the organization ${organizationId}`,
    );
  }
}

function _createHeaderOfCSV(targetProfile, idPixLabel, organizationType, organizationIsManagingStudents, stages) {
  return [
    'Nom de l\'organisation',
    'ID Campagne',
    'Nom de la campagne',
    'Nom du Profil Cible',
    'Nom du Participant',
    'Prénom du Participant',
    ...((organizationType === 'SUP' && organizationIsManagingStudents) ? ['Numéro Étudiant'] : []),

    ...(idPixLabel ? [idPixLabel] : []),

    '% de progression',
    'Date de début',
    'Partage (O/N)',
    'Date du partage',
    ...(stages[0] ? [`Palier obtenu (/${stages.length})`] : []),

    ...(_.flatMap(targetProfile.badges, (badge) => [
      `${badge} obtenu (O/N)`,
    ])),
    '% maitrise de l\'ensemble des acquis du profil',

    ...(_.flatMap(targetProfile.competences, (competence) => [
      `% de maitrise des acquis de la compétence ${competence.name}`,
      `Nombre d'acquis du profil cible dans la compétence ${competence.name}`,
      `Acquis maitrisés dans la compétence ${competence.name}`,
    ])),

    ...(_.flatMap(targetProfile.areas, (area) => [
      `% de maitrise des acquis du domaine ${area.title}`,
      `Nombre d'acquis du profil cible du domaine ${area.title}`,
      `Acquis maitrisés du domaine ${area.title}`,
    ])),

    ...(organizationType === 'SCO' ? [] : targetProfile.skillNames),
  ];
}
