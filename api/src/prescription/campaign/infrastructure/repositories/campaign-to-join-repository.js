import { CAMPAIGN_FEATURES } from '../../../../shared/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CampaignToJoin } from '../../domain/read-models/CampaignToJoin.js';

const getByCode = async function ({ code, organizationFeatureAPI }) {
  const knexConn = DomainTransaction.getConnection();

  const result = await knexConn('campaigns')
    .select('campaigns.*')
    .select({
      organizationId: 'organizations.id',
      organizationName: 'organizations.name',
      organizationType: 'organizations.type',
      organizationLogoUrl: 'organizations.logoUrl',
      organizationIsManagingStudents: 'organizations.isManagingStudents',
      organizationShowNPS: 'organizations.showNPS',
      organizationFormNPSUrl: 'organizations.formNPSUrl',
      targetProfileName: 'target-profiles.name',
      targetProfileImageUrl: 'target-profiles.imageUrl',
      targetProfileIsSimplifiedAccess: 'target-profiles.isSimplifiedAccess',
      identityProvider: 'organizations.identityProviderForCampaigns',
    })
    .join('organizations', 'organizations.id', 'campaigns.organizationId')
    .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
    .where('campaigns.code', code.toUpperCase())
    .first();

  if (!result) {
    throw new NotFoundError(`La campagne au code ${code} n'existe pas ou son accès est restreint`);
  }

  const campaignFeatures = await knexConn('campaign-features')
    .select('features.key', 'params')
    .join('features', 'features.id', 'featureId')
    .where({ campaignId: result.id })
    .whereIn('features.key', [CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.key, CAMPAIGN_FEATURES.EXTERNAL_ID.key]);

  const externalFeature = campaignFeatures.find((feature) => feature.key === CAMPAIGN_FEATURES.EXTERNAL_ID.key);
  const hasRecommendationEngine = campaignFeatures.some(
    (feature) => feature.key === CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.key,
  );

  const { hasLearnersImportFeature } = await organizationFeatureAPI.getAllFeaturesFromOrganization(
    result.organizationId,
  );

  return new CampaignToJoin({
    ...result,
    externalIdLabel: externalFeature?.params?.label,
    externalIdType: externalFeature?.params?.type,
    recommendationEngine: hasRecommendationEngine,
    hasLearnersImportFeature,
  });
};

export { getByCode };
