import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);
dayjs.extend(timezone);

import { CampaignTypeError } from '../../../../shared/domain/errors.js';
import { getI18n } from '../../../../shared/infrastructure/i18n/i18n.js';
import { CampaignAssessmentExport } from '../../infrastructure/serializers/csv/campaign-assessment-export.js';

/**
 * @typedef {import ('./index.js').CampaignRepository} CampaignRepository
 * @typedef {import ('./index.js').CampaignParticipationInfoRepository} CampaignParticipationInfoRepository
 * @typedef {import ('./index.js').OrganizationRepository} OrganizationRepository
 * @typedef {import ('./index.js').KnowledgeStateSnapshotRepository} KnowledgeStateSnapshotRepository
 * @typedef {import ('./index.js').CampaignCsvExportService} CampaignCsvExportService
 * @typedef {import ('./index.js').TargetProfileRepository} TargetProfileRepository
 * @typedef {import ('./index.js').LearningContentRepository} LearningContentRepository
 * @typedef {import ('./index.js').StageCollectionRepository} StageCollectionRepository
 * @typedef {import ('./index.js').OrganizationFeatureApi} OrganizationFeatureApi
 * @typedef {import ('./index.js').OrganizationLearnerImportFormat} OrganizationLearnerImportFormat
 * @typedef {import ('./index.js').StageAcquisitionRepository} StageAcquisitionRepository
 * @typedef {import ('./index.js').BadgeAcquisitionRepository} BadgeAcquisitionRepository
 */

/**
 * @param {Object} params
 * @param {Number} params.campaignId
 * @param {Object} params.writableStream
 * @param {string} locale
 * @param {CampaignRepository} params.campaignRepository
 * @param {CampaignParticipationInfoRepository} params.campaignParticipationInfoRepository
 * @param {OrganizationRepository} params.organizationRepository
 * @param {KnowledgeStateSnapshotRepository} params.knowledgeStateSnapshotRepository
 * @param {CampaignCsvExportService} params.campaignCsvExportService
 * @param {TargetProfileRepository} params.targetProfileRepository
 * @param {LearningContentRepository} params.learningContentRepository
 * @param {StageCollectionRepository} params.stageCollectionRepository
 * @param {OrganizationFeatureApi} params.organizationFeatureApi
 * @param {OrganizationLearnerImportFormat} params.organizationLearnerImportFormatRepository
 * @param {BadgeAcquisitionRepository} params.badgeAcquisitionRepository
 * @param {StageAcquisitionRepository} params.stageAcquisitionRepository
 */
const startWritingCampaignAssessmentResultsToStream = async function ({
  campaignId,
  writableStream,
  locale,
  campaignRepository,
  campaignParticipationInfoRepository,
  organizationRepository,
  knowledgeStateForParticipationService,
  badgeAcquisitionRepository,
  targetProfileRepository,
  learningContentRepository,
  stageCollectionRepository,
  organizationFeatureApi,
  organizationLearnerImportFormatRepository,
  stageAcquisitionRepository,
  improvementService,
}) {
  let additionalHeaders = [];
  const campaign = await campaignRepository.get(campaignId);

  if (!campaign.isAssessment && !campaign.isExam) {
    throw new CampaignTypeError();
  }

  const targetProfile = await targetProfileRepository.getByCampaignId({
    campaignId: campaign.id,
  });
  const learningContent = await learningContentRepository.findByCampaignId(campaign.id, locale);
  const stageCollection = await stageCollectionRepository.findStageCollection({
    campaignId,
  });

  const organization = await organizationRepository.get(campaign.organizationId);
  const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaign.id);

  const organizationFeatures = await organizationFeatureApi.getAllFeaturesFromOrganization(campaign.organizationId);
  if (organizationFeatures.hasLearnersImportFeature) {
    const importFormat = await organizationLearnerImportFormatRepository.get(campaign.organizationId);
    additionalHeaders = importFormat.exportableColumns;
  }

  const campaignAssessment = new CampaignAssessmentExport({
    outputStream: writableStream,
    organization,
    targetProfile,
    learningContent,
    stageCollection,
    campaign,
    locale,
    additionalHeaders,
  });

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the map
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  campaignAssessment
    .export({
      campaignParticipationInfos,
      knowledgeStateForParticipationService,
      badgeAcquisitionRepository,
      stageAcquisitionRepository,
      improvementService,
    })
    .then(() => {
      writableStream.end();
    })
    .catch((error) => {
      writableStream.emit('error', error);
      throw error;
    });

  const i18n = getI18n(locale);
  const fileName = i18n.__('campaign-export.common.file-name', {
    name: campaign.name,
    id: campaign.id,
    date: dayjs().tz('Europe/Berlin').format('YYYY-MM-DD-HHmm'),
  });
  return { fileName };
};
export { startWritingCampaignAssessmentResultsToStream };
