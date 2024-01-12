import _ from 'lodash';
import bluebird from 'bluebird';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

import {
  CONCURRENCY_HEAVY_OPERATIONS,
  CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING,
} from '../../../../../lib/infrastructure/constants.js';
import { CampaignTypeError } from '../../../../../lib/domain/errors.js';
import * as csvSerializer from '../../../../../lib/infrastructure/serializers/csv/csv-serializer.js';
import { CampaignLearningContent } from '../../../../../lib/domain/models/CampaignLearningContent.js';

const startWritingCampaignAssessmentResultsToStream = async function ({
  campaignId,
  writableStream,
  i18n,
  campaignRepository,
  campaignParticipationInfoRepository,
  organizationRepository,
  knowledgeElementSnapshotRepository,
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
        const userIdsAndDates = campaignParticipationInfoChunk.map((campaignParticipationInfo) => [
          campaignParticipationInfo.userId,
          campaignParticipationInfo.sharedAt,
        ]);
        const knowledgeElementsByUserIdAndCompetenceId =
          await knowledgeElementSnapshotRepository.findByUserIdsAndSnappedAtDatesSyncCampaignParticipationId(
            userIdsAndDates,
            campaignLearningContent,
          );

        let acquiredBadgesByCampaignParticipations;
        if (targetProfile.hasBadges) {
          const campaignParticipationsIds = campaignParticipationInfoChunk.map(
            (campaignParticipationInfo) => campaignParticipationInfo.campaignParticipationId,
          );
          acquiredBadgesByCampaignParticipations =
            await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({ campaignParticipationsIds });
        }

        let csvLines = '';

        campaignParticipationInfoChunk.forEach((campaignParticipationInfo) => {
          const sharedResultInfo = knowledgeElementsByUserIdAndCompetenceId.find(
            (knowledElementForSharedParticipation) =>
              campaignParticipationInfo.campaignParticipationId ===
              knowledElementForSharedParticipation.campaignParticipationId,
          );

          const acquiredBadges =
            acquiredBadgesByCampaignParticipations &&
            acquiredBadgesByCampaignParticipations[campaignParticipationInfo.campaignParticipationId]
              ? acquiredBadgesByCampaignParticipations[campaignParticipationInfo.campaignParticipationId].map(
                  (badge) => badge.title,
                )
              : [];

          const csvLine = campaignCsvExportService.createOneCsvLine({
            organization,
            campaign,
            campaignParticipationInfo,
            targetProfile,
            learningContent: campaignLearningContent,
            stageCollection,
            participantKnowledgeElementsByCompetenceId: sharedResultInfo ? sharedResultInfo.knowledgeElements : null,
            acquiredBadges,
            translate,
          });

          csvLines = csvLines.concat(csvLine);
        });

        writableStream.write(csvLines);
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
