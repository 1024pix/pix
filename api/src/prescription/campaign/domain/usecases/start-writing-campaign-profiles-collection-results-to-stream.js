import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);
dayjs.extend(timezone);

import { CampaignTypeError } from '../../../../shared/domain/errors.js';
import { getI18n } from '../../../../shared/infrastructure/i18n/i18n.js';
import { CampaignProfilesCollectionExport } from '../../infrastructure/serializers/csv/campaign-profiles-collection-export.js';

async function* withErrorLogging(csvChunks, logger) {
  try {
    yield* csvChunks;
  } catch (error) {
    logger.error(error, `Error while generating csv campaign results.`);
    throw error;
  }
}

const startWritingCampaignProfilesCollectionResultsToStream = async function ({
  campaignId,
  locale,
  campaignRepository,
  competenceRepository,
  campaignParticipationRepository,
  organizationRepository,
  placementProfileService,
  organizationFeatureApi,
  organizationLearnerImportFormatRepository,
  logger,
}) {
  const campaign = await campaignRepository.get(campaignId);
  const i18n = getI18n(locale);
  let additionalHeaders = [];

  if (!campaign.isProfilesCollection) {
    throw new CampaignTypeError();
  }

  const organizationFeatures = await organizationFeatureApi.getAllFeaturesFromOrganization(campaign.organizationId);
  if (organizationFeatures.hasLearnersImportFeature) {
    const importFormat = await organizationLearnerImportFormatRepository.get(campaign.organizationId);
    additionalHeaders = importFormat.exportableColumns;
  }

  const allPixCompetences = await competenceRepository.listPixCompetencesOnly({ locale: i18n.getLocale() });
  const organization = await organizationRepository.get(campaign.organizationId);
  const { models: campaignParticipationResultDatas } = await campaignParticipationRepository.findInfoByCampaignId({
    campaignId: campaign.id,
    page: { size: 1000000, number: 1 },
  });

  const campaignProfilesCollectionExport = new CampaignProfilesCollectionExport({
    organization,
    campaign,
    competences: allPixCompetences,
    locale,
    additionalHeaders,
  });

  const csvChunks = withErrorLogging(
    campaignProfilesCollectionExport.export(campaignParticipationResultDatas, placementProfileService),
    logger,
  );

  const fileName = i18n.__('campaign-export.common.file-name', {
    name: campaign.name,
    id: campaign.id,
    date: dayjs().tz('Europe/Berlin').format('YYYY-MM-DD-HHmm'),
  });

  return { fileName, csvChunks };
};

export { startWritingCampaignProfilesCollectionResultsToStream };
