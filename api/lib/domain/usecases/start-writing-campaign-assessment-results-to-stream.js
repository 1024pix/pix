const _ = require('lodash');
const bluebird = require('bluebird');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const constants = require('../../infrastructure/constants');
const { UserNotAuthorizedToGetCampaignResultsError, CampaignTypeError } = require('../errors');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');
const CampaignLearningContent = require('../models/CampaignLearningContent');
const CampaignStages = require('../read-models/campaign/CampaignStages');

module.exports = async function startWritingCampaignAssessmentResultsToStream({
  userId,
  campaignId,
  writableStream,
  i18n,
  campaignRepository,
  userRepository,
  campaignParticipationInfoRepository,
  organizationRepository,
  knowledgeElementRepository,
  badgeAcquisitionRepository,
  campaignCsvExportService,
  targetProfileRepository,
  learningContentRepository,
}) {
  const campaign = await campaignRepository.get(campaignId);
  const translate = i18n.__;

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  if (!campaign.isAssessment()) {
    throw new CampaignTypeError();
  }

  const targetProfile = await targetProfileRepository.getByCampaignId(campaign.id);
  const learningContent = await learningContentRepository.findByCampaignId(campaign.id, i18n.getLocale());
  const stages = await campaignRepository.findStages({ campaignId });
  const campaignStages = new CampaignStages({ stages });
  const campaignLearningContent = new CampaignLearningContent(learningContent);

  const organization = await organizationRepository.get(campaign.organizationId);
  const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaign.id);

  // Create HEADER of CSV
  const headers = _createHeaderOfCSV(
    targetProfile,
    campaign.idPixLabel,
    organization,
    translate,
    campaignLearningContent,
    campaignStages
  );

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + csvSerializer.serializeLine(headers);

  writableStream.write(headerLine);

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the map
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  const campaignParticipationInfoChunks = _.chunk(
    campaignParticipationInfos,
    constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING
  );
  bluebird
    .map(
      campaignParticipationInfoChunks,
      async (campaignParticipationInfoChunk) => {
        const userIdsAndDates = Object.fromEntries(
          campaignParticipationInfoChunk.map((campaignParticipationInfo) => {
            return [campaignParticipationInfo.userId, campaignParticipationInfo.sharedAt];
          })
        );
        const knowledgeElementsByUserIdAndCompetenceId =
          await knowledgeElementRepository.findGroupedByCompetencesForUsersWithinLearningContent(
            userIdsAndDates,
            campaignLearningContent
          );

        let acquiredBadgesByCampaignParticipations;
        if (targetProfile.hasBadges) {
          const campaignParticipationsIds = campaignParticipationInfoChunk.map(
            (campaignParticipationInfo) => campaignParticipationInfo.campaignParticipationId
          );
          acquiredBadgesByCampaignParticipations =
            await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({ campaignParticipationsIds });
        }

        let csvLines = '';
        for (const [strParticipantId, participantKnowledgeElementsByCompetenceId] of Object.entries(
          knowledgeElementsByUserIdAndCompetenceId
        )) {
          const participantId = parseInt(strParticipantId);
          const campaignParticipationInfo = campaignParticipationInfoChunk.find(
            (campaignParticipationInfo) => campaignParticipationInfo.userId === participantId
          );
          const acquiredBadges =
            acquiredBadgesByCampaignParticipations &&
            acquiredBadgesByCampaignParticipations[campaignParticipationInfo.campaignParticipationId]
              ? acquiredBadgesByCampaignParticipations[campaignParticipationInfo.campaignParticipationId].map(
                  (badge) => badge.title
                )
              : [];
          const csvLine = campaignCsvExportService.createOneCsvLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfile,
            learningContent: campaignLearningContent,
            campaignStages,
            participantKnowledgeElementsByCompetenceId,
            acquiredBadges,
            translate,
          });
          csvLines = csvLines.concat(csvLine);
        }

        writableStream.write(csvLines);
      },
      { concurrency: constants.CONCURRENCY_HEAVY_OPERATIONS }
    )
    .then(() => {
      writableStream.end();
    })
    .catch((error) => {
      writableStream.emit('error', error);
      throw error;
    });

  const fileName = translate('campaign-export.common.file-name', {
    name: campaign.name,
    id: campaign.id,
    date: dayjs().tz('Europe/Berlin').format('YYYY-MM-DD-HHmm'),
  });
  return { fileName };
};

async function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(
      `User does not have an access to the organization ${organizationId}`
    );
  }
}

function _createHeaderOfCSV(targetProfile, idPixLabel, organization, translate, learningContent, campaignStages) {
  const forSupStudents = organization.isSup && organization.isManagingStudents;
  const displayDivision = organization.isSco && organization.isManagingStudents;

  return [
    translate('campaign-export.common.organization-name'),
    translate('campaign-export.common.campaign-id'),
    translate('campaign-export.common.campaign-name'),
    translate('campaign-export.assessment.target-profile-name'),
    translate('campaign-export.common.participant-lastname'),
    translate('campaign-export.common.participant-firstname'),
    ...(displayDivision ? [translate('campaign-export.common.participant-division')] : []),
    ...(forSupStudents ? [translate('campaign-export.common.participant-group')] : []),
    ...(forSupStudents ? [translate('campaign-export.common.participant-student-number')] : []),
    ...(idPixLabel ? [idPixLabel] : []),

    translate('campaign-export.assessment.progress'),
    translate('campaign-export.assessment.started-on'),
    translate('campaign-export.assessment.is-shared'),
    translate('campaign-export.assessment.shared-on'),
    ...(campaignStages.hasReachableStages
      ? [translate('campaign-export.assessment.success-rate', { value: campaignStages.reachableStages.length })]
      : []),

    ..._.flatMap(targetProfile.badges, (badge) => [
      translate('campaign-export.assessment.thematic-result-name', { name: badge.title }),
    ]),
    translate('campaign-export.assessment.mastery-percentage-target-profile'),

    ..._.flatMap(learningContent.competences, (competence) => [
      translate('campaign-export.assessment.skill.mastery-percentage', { name: competence.name }),
      translate('campaign-export.assessment.skill.total-items', { name: competence.name }),
      translate('campaign-export.assessment.skill.items-successfully-completed', { name: competence.name }),
    ]),

    ..._.flatMap(learningContent.areas, (area) => [
      translate('campaign-export.assessment.competence-area.mastery-percentage', { name: area.title }),
      translate('campaign-export.assessment.competence-area.total-items', { name: area.title }),
      translate('campaign-export.assessment.competence-area.items-successfully-completed', { name: area.title }),
    ]),

    ...(organization.showSkills ? learningContent.skillNames : []),
  ];
}
