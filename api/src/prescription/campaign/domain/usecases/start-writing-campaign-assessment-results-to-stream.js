import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);
dayjs.extend(timezone);

import * as injectedBadgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import * as injectedStageAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/stage-acquisition-repository.js';
import * as injectedOrganizationFeatureApi from '../../../../organizational-entities/application/api/organization-features-api.js';
import { CampaignTypeError } from '../../../../shared/domain/errors.js';
import * as injectedKnowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedOrganizationLearnerImportFormatRepository from '../../../learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import * as injectedLearningContentRepository from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import * as injectedCampaignParticipationInfoRepository from '../../infrastructure/repositories/campaign-participation-info-repository.js';
import * as injectedCampaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';
import * as injectedKnowledgeElementSnapshotRepository from '../../infrastructure/repositories/knowledge-element-snapshot-repository.js';
import * as injectedStageCollectionRepository from '../../infrastructure/repositories/stage-collection-repository.js';
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
 * @typedef {import ('./index.js').StageAcquisitionRepository} StageAcquisitionRepository
 * @typedef {import ('./index.js').BadgeAcquisitionRepository} BadgeAcquisitionRepository
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
 * @param {BadgeAcquisitionRepository} params.badgeAcquisitionRepository
 * @param {StageAcquisitionRepository} params.stageAcquisitionRepository
 */
const startWritingCampaignAssessmentResultsToStream = async function ({
  campaignId,
  writableStream,
  i18n,
  campaignRepository = injectedCampaignRepository,
  campaignParticipationInfoRepository = injectedCampaignParticipationInfoRepository,
  organizationRepository = injectedOrganizationRepository,
  knowledgeElementSnapshotRepository = injectedKnowledgeElementSnapshotRepository,
  knowledgeElementRepository = injectedKnowledgeElementRepository,
  badgeAcquisitionRepository = injectedBadgeAcquisitionRepository,
  targetProfileRepository = injectedRepositories.targetProfileRepository,
  learningContentRepository = injectedLearningContentRepository,
  stageCollectionRepository = injectedStageCollectionRepository,
  organizationFeatureApi = injectedOrganizationFeatureApi,
  organizationLearnerImportFormatRepository = injectedOrganizationLearnerImportFormatRepository,
  stageAcquisitionRepository = injectedStageAcquisitionRepository,
} = {}) {
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
      stageAcquisitionRepository,
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
