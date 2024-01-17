import { knex } from '../../../../../db/knex-database-connection.js';
import { CampaignCreator } from '../../domain/models/CampaignCreator.js';

async function get(organizationId) {
  const availableTargetProfileIds = await knex('target-profiles')
    .leftJoin('target-profile-shares', 'targetProfileId', 'target-profiles.id')
    .where({ outdated: false })
    .andWhere((queryBuilder) => {
      queryBuilder
        .where({ isPublic: true })
        .orWhere({ ownerOrganizationId: organizationId })
        .orWhere({ organizationId });
    })
    .pluck('target-profiles.id');

  const availableFeatures = await knex('features')
    .select('key', knex.raw('"organization-features"."organizationId" IS NOT NULL as enabled'))
    .leftJoin('organization-features', function () {
      this.on('features.id', 'organization-features.featureId').andOn(
        'organization-features.organizationId',
        organizationId,
      );
    });

  const organizationFeatures = availableFeatures.reduce(
    (features, { key, enabled }) => ({ ...features, [key]: enabled }),
    {},
  );

  return new CampaignCreator({ availableTargetProfileIds, organizationFeatures });
}

export { get };
