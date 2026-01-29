import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CampaignCreator } from '../../domain/models/CampaignCreator.js';

async function get(organizationId) {
  const knexConn = DomainTransaction.getConnection();
  const availableTargetProfileIds = await knexConn('target-profiles')
    .where({ outdated: false })
    .andWhere((queryBuilder) => {
      queryBuilder
        .where({ ownerOrganizationId: organizationId })
        .orWhere(
          'id',
          'in',
          knexConn.select('targetProfileId').from('target-profile-shares').where({ organizationId }),
        );
    })
    .pluck('target-profiles.id');

  const availableFeatures = await knexConn('features')
    .select('key', knexConn.raw('"organization-features"."organizationId" IS NOT NULL as enabled'))
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
