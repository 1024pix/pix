import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);
dayjs.extend(timezone);

import * as injectedOrganizationFeatureApi from '../../../../organizational-entities/application/api/organization-features-api.js';
import { CampaignTypeError } from '../../../../shared/domain/errors.js';
import * as injectedPlacementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as injectedCompetenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedCampaignParticipationRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as injectedOrganizationLearnerImportFormatRepository from '../../../learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import * as injectedCampaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import { CampaignProfilesCollectionExport } from '../../infrastructure/serializers/csv/campaign-profiles-collection-export.js';

const startWritingCampaignProfilesCollectionResultsToStream = async function ({
  campaignId,
  writableStream,
  i18n,
  campaignRepository = injectedCampaignRepository,
  competenceRepository = injectedCompetenceRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  organizationRepository = injectedOrganizationRepository,
  placementProfileService = injectedPlacementProfileService,
  organizationFeatureApi = injectedOrganizationFeatureApi,
  organizationLearnerImportFormatRepository = injectedOrganizationLearnerImportFormatRepository,
} = {}) {
  const campaign = await campaignRepository.get(campaignId);
  const translate = i18n.__;
  let additionalHeaders = [];

  if (!campaign.isProfilesCollection) {
    throw new CampaignTypeError();
  }

  const organizationFeatures = await organizationFeatureApi.getAllFeaturesFromOrganization(campaign.organizationId);
  if (organizationFeatures.hasLearnersImportFeature) {
    const importFormat = await organizationLearnerImportFormatRepository.get(campaign.organizationId);
    additionalHeaders = importFormat.exportableColumns;
  }

  const [allPixCompetences, organization, { models: campaignParticipationResultDatas }] = await Promise.all([
    competenceRepository.listPixCompetencesOnly({ locale: i18n.getLocale() }),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findInfoByCampaignId({
      campaignId: campaign.id,
      page: { size: 1000000, number: 1 },
    }),
  ]);

  const campaignProfilesCollectionExport = new CampaignProfilesCollectionExport({
    outputStream: writableStream,
    organization,
    campaign,
    competences: allPixCompetences,
    translate,
    additionalHeaders,
  });

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the map
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  campaignProfilesCollectionExport
    .export(campaignParticipationResultDatas, placementProfileService)
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

export { startWritingCampaignProfilesCollectionResultsToStream };
