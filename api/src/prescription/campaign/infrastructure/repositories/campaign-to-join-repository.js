import { knex } from '../../../../../db/knex-database-connection.js';
import { CAMPAIGN_FEATURES } from '../../../../shared/domain/constants.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CampaignToJoin } from '../../domain/read-models/CampaignToJoin.js';

const getByCode = async function ({ code, organizationFeatureAPI }) {
  const result = await knex('campaigns')
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
    .where('campaigns.code', code)
    .first();

  if (!result) {
    throw new NotFoundError(`La campagne au code ${code} n'existe pas ou son accès est restreint`);
  }

  const externalIdFeature = await knex('campaign-features')
    .select('params')
    .join('features', 'features.id', 'featureId')
    .where({ campaignId: result.id, 'features.key': CAMPAIGN_FEATURES.EXTERNAL_ID.key })
    .first();

  const { hasLearnersImportFeature } = await organizationFeatureAPI.getAllFeaturesFromOrganization(
    result.organizationId,
  );

  return new CampaignToJoin({
    ...result,
    ...{ idPixLabel: externalIdFeature?.params?.label, idPixType: externalIdFeature?.params?.type },
    hasLearnersImportFeature,
  });
};

export { getByCode };
