import { CAMPAIGN_FEATURES } from '../../../../shared/domain/constants.js';
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

  const externalIdFeature = await knexConn('campaign-features')
    .select('params')
    .join('features', 'features.id', 'featureId')
    .where({ campaignId: result.id, 'features.key': CAMPAIGN_FEATURES.EXTERNAL_ID.key })
    .first();

  const { hasLearnersImportFeature } = await organizationFeatureAPI.getAllFeaturesFromOrganization(
    result.organizationId,
  );

  return new CampaignToJoin({
    ...result,
    ...{ externalIdLabel: externalIdFeature?.params?.label, externalIdType: externalIdFeature?.params?.type },
    hasLearnersImportFeature,
  });
};

export { getByCode };
