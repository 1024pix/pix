import bluebird from 'bluebird';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import _ from 'lodash';
dayjs.extend(utc);
dayjs.extend(timezone);

import {
  CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING,
  CONCURRENCY_HEAVY_OPERATIONS,
} from '../../../../../lib/infrastructure/constants.js';
import { CampaignTypeError } from '../../../../shared/domain/errors.js';
import { CampaignLearningContent } from '../../../../shared/domain/models/CampaignLearningContent.js';
import * as csvSerializer from '../../../../shared/infrastructure/serializers/csv/csv-serializer.js';

const startWritingCampaignAssessmentResultsToStream = async function ({
  campaignId,
  writableStream,
  i18n,
  campaignRepository,
  campaignParticipationInfoRepository,
  organizationRepository,
  knowledgeElementSnapshotRepository,
  knowledgeElementRepository,
  badgeAcquisitionRepository,
  campaignCsvExportService,
  targetProfileRepository,
  learningContentRepository,
  stageCollectionRepository,
}) {
  const campaign = await campaignRepository.get(campaignId);
  const translate = i18n.__;

  if (!campaign.isAssessment()) {
    throw new CampaignTypeError();
  }

  const targetProfile = await targetProfileRepository.getByCampaignId(campaign.id);
  const learningContent = await learningContentRepository.findByCampaignId(campaign.id, i18n.getLocale());
  const stageCollection = await stageCollectionRepository.findStageCollection({ campaignId });
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
    stageCollection,
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
  const campaignParticipationInfoChunks = _.chunk(campaignParticipationInfos, CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
  bluebird
    .map(
      campaignParticipationInfoChunks,
      async (campaignParticipationInfoChunk) => {
        const sharedParticipations = campaignParticipationInfoChunk.filter(({ isShared }) => isShared);
        const startedParticipations = campaignParticipationInfoChunk.filter(
          ({ isShared, isCompleted }) => !isShared && !isCompleted,
        );

        const sharedKnowledgeElementsByUserIdAndCompetenceId =
          await knowledgeElementSnapshotRepository.findMultipleUsersFromUserIdsAndSnappedAtDates(
            sharedParticipations.map(({ userId, sharedAt }) => ({ userId, sharedAt })),
          );

        const othersKnowledgeElementsByUserIdAndCompetenceId = await knowledgeElementRepository.findUniqByUserIds(
          startedParticipations.map(({ userId }) => userId),
        );

        let acquiredBadgesByCampaignParticipations;
        if (targetProfile.hasBadges) {
          const campaignParticipationsIds = campaignParticipationInfoChunk.map(
            (campaignParticipationInfo) => campaignParticipationInfo.campaignParticipationId,
          );
          acquiredBadgesByCampaignParticipations =
            await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({ campaignParticipationsIds });
        }

        const csvLines = campaignParticipationInfoChunk.map((campaignParticipationInfo) => {
          let participantKnowledgeElementsByCompetenceId = [];

          if (campaignParticipationInfo.isShared) {
            const sharedResultInfo = sharedKnowledgeElementsByUserIdAndCompetenceId.find(
              (knowledElementForSharedParticipation) => {
                const sameUserId = campaignParticipationInfo.userId === knowledElementForSharedParticipation.userId;
                const sameDate =
                  campaignParticipationInfo.sharedAt &&
                  campaignParticipationInfo.sharedAt.getTime() ===
                    knowledElementForSharedParticipation.snappedAt.getTime();

                return sameUserId && sameDate;
              },
            );

            participantKnowledgeElementsByCompetenceId =
              campaignLearningContent.getKnowledgeElementsGroupedByCompetence(sharedResultInfo.knowledgeElements);
          } else if (campaignParticipationInfo.isCompleted === false) {
            const othersResultInfo = othersKnowledgeElementsByUserIdAndCompetenceId.find(
              (knowledElementForOtherParticipation) =>
                campaignParticipationInfo.userId === knowledElementForOtherParticipation.userId,
            );
            participantKnowledgeElementsByCompetenceId =
              campaignLearningContent.getKnowledgeElementsGroupedByCompetence(othersResultInfo.knowledgeElements);
          }

          const acquiredBadges =
            acquiredBadgesByCampaignParticipations &&
            acquiredBadgesByCampaignParticipations[campaignParticipationInfo.campaignParticipationId]
              ? acquiredBadgesByCampaignParticipations[campaignParticipationInfo.campaignParticipationId].map(
                  (badge) => badge.title,
                )
              : [];

          return campaignCsvExportService.createOneCsvLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfile,
            learningContent: campaignLearningContent,
            stageCollection,
            participantKnowledgeElementsByCompetenceId,
            acquiredBadges,
            translate,
          });
        });

        writableStream.write(csvLines.join(''));
      },
      { concurrency: CONCURRENCY_HEAVY_OPERATIONS },
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

export { startWritingCampaignAssessmentResultsToStream };

function _createHeaderOfCSV(targetProfile, idPixLabel, organization, translate, learningContent, stageCollection) {
  const forSupStudents = organization.isSup && organization.isManagingStudents;
  const displayDivision = organization.isSco && organization.isManagingStudents;

  return [
    translate('campaign-export.common.organization-name'),
    translate('campaign-export.common.campaign-id'),
    translate('campaign-export.common.campaign-code'),
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
    ...(stageCollection.hasStage
      ? [translate('campaign-export.assessment.success-rate', { value: stageCollection.totalStages - 1 })]
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
