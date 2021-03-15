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
    i18n,
    campaignRepository,
    userRepository,
    targetProfileWithLearningContentRepository,
    campaignParticipationInfoRepository,
    organizationRepository,
    knowledgeElementRepository,
    badgeAcquisitionRepository,
    campaignCsvExportService,
  }) {

  const campaign = await campaignRepository.get(campaignId);
  const translate = i18n.__;

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  const targetProfileWithLearningContent = await targetProfileWithLearningContentRepository.get({ id: campaign.targetProfileId, locale: i18n.getLocale() });
  const organization = await organizationRepository.get(campaign.organizationId);
  const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaign.id);

  // Create HEADER of CSV
  const headers = _createHeaderOfCSV(targetProfileWithLearningContent, campaign.idPixLabel, organization, translate);

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
      await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers(userIdsAndDates, targetProfileWithLearningContent);

    let acquiredBadgesByUsers;
    if (targetProfileWithLearningContent.hasBadges()) {
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
        targetProfileWithLearningContent,
        participantKnowledgeElementsByCompetenceId,
        acquiredBadges,
        translate,
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

  const fileName = translate('campaign-export.common.file-name', { name: campaign.name, id: campaign.id, date: moment.utc().format('YYYY-MM-DD-hhmm') });
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

function _createHeaderOfCSV(targetProfile, idPixLabel, organization, translate) {
  const displayStudentNumber = organization.isSup && organization.isManagingStudents;
  const displayDivision = organization.isSco && organization.isManagingStudents;

  return [
    translate('campaign-export.common.organization-name'),
    translate('campaign-export.common.campaign-id'),
    translate('campaign-export.common.campaign-name'),
    translate('campaign-export.assessment.target-profile-name'),
    translate('campaign-export.common.participant-lastname'),
    translate('campaign-export.common.participant-firstname'),
    ...(displayDivision ? [translate('campaign-export.common.participant-division')] : []),
    ...(displayStudentNumber ? [translate('campaign-export.common.participant-student-number')] : []),
    ...(idPixLabel ? [idPixLabel] : []),

    translate('campaign-export.assessment.progress'),
    translate('campaign-export.assessment.started-on'),
    translate('campaign-export.assessment.is-shared'),
    translate('campaign-export.assessment.shared-on'),
    ...(targetProfile.hasReachableStages() ? [translate('campaign-export.assessment.success-rate', { value: targetProfile.reachableStages.length })] : []),

    ...(_.flatMap(targetProfile.badges, (badge) => [
      translate('campaign-export.assessment.thematic-result-name', { name: badge.title }),
    ])),
    translate('campaign-export.assessment.mastery-percentage-target-profile'),

    ...(_.flatMap(targetProfile.competences, (competence) => [
      translate('campaign-export.assessment.skill.mastery-percentage', { name: competence.name }),
      translate('campaign-export.assessment.skill.total-items', { name: competence.name }),
      translate('campaign-export.assessment.skill.items-successfully-completed', { name: competence.name }),
    ])),

    ...(_.flatMap(targetProfile.areas, (area) => [
      translate('campaign-export.assessment.competence-area.mastery-percentage', { name: area.title }),
      translate('campaign-export.assessment.competence-area.total-items', { name: area.title }),
      translate('campaign-export.assessment.competence-area.items-successfully-completed', { name: area.title }),
    ])),

    ...(organization.isSco ? [] : targetProfile.skillNames),
  ];
}
