import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);
dayjs.extend(timezone);

import { CampaignTypeError } from '../../../../shared/domain/errors.js';
import { CampaignAssessmentExport } from '../../infrastructure/serializers/csv/campaign-assessment-export.js';

/**
 * @typedef {import ('./index.js').CampaignRepository} CampaignRepository
 * @typedef {import ('./index.js').CampaignParticipationInfoRepository} CampaignParticipationInfoRepository
 * @typedef {import ('./index.js').OrganizationRepository} OrganizationRepository
 * @typedef {import ('./index.js').KnowledgeElementSnapshotRepository} KnowledgeElementSnapshotRepository
 * @typedef {import ('./index.js').CampaignCsvExportService} CampaignCsvExportService
 * @typedef {import ('./index.js').TargetProfileRepository} TargetProfileRepository
 * @typedef {import ('./index.js').LearningContentRepository} LearningContentRepository
 * @typedef {import ('./index.js').StageCollectionRepository} StageCollectionRepository
 * @typedef {import ('./index.js').OrganizationFeatureApi} OrganizationFeatureApi
 * @typedef {import ('./index.js').OrganizationLearnerImportFormat} OrganizationLearnerImportFormat
 */

/**
 * @param {Object} params
 * @param {Number} params.campaignId
 * @param {Object} params.writableStream
 * @param {Object} params.i18n
 * @param {CampaignRepository} params.campaignRepository
 * @param {CampaignParticipationInfoRepository} params.campaignParticipationInfoRepository
 * @param {OrganizationRepository} params.organizationRepository
 * @param {KnowledgeElementSnapshotRepository} params.knowledgeElementSnapshotRepository
 * @param {CampaignCsvExportService} params.campaignCsvExportService
 * @param {TargetProfileRepository} params.targetProfileRepository
 * @param {LearningContentRepository} params.learningContentRepository
 * @param {StageCollectionRepository} params.stageCollectionRepository
 * @param {OrganizationFeatureApi} params.organizationFeatureApi
 * @param {OrganizationLearnerImportFormat} params.organizationLearnerImportFormatRepository
 */
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
  targetProfileRepository,
  learningContentRepository,
  stageCollectionRepository,
  organizationFeatureApi,
  organizationLearnerImportFormatRepository,
}) {
  let additionalHeaders = [];
  const campaign = await campaignRepository.get(campaignId);
  const translate = i18n.__;

  if (!campaign.isAssessment && !campaign.isExam) {
    throw new CampaignTypeError();
  }

  const targetProfile = await targetProfileRepository.getByCampaignId({ campaignId: campaign.id });
  const learningContent = await learningContentRepository.findByCampaignId(campaign.id, i18n.getLocale());
  const stageCollection = await stageCollectionRepository.findStageCollection({ campaignId });

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
    translate,
    additionalHeaders,
  });

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the map
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  campaignAssessment
    .export(
      campaignParticipationInfos,
      knowledgeElementRepository,
      badgeAcquisitionRepository,
      knowledgeElementSnapshotRepository,
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
