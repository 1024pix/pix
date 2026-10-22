import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { LtiCampaign } from '../../domain/models/LtiCampaign.js';

export async function getAllByOrganizationIds({ organizationIds }) {
  const knexConn = DomainTransaction.getConnection();
  const campaigns = await knexConn('campaigns')
    .select(
      'campaigns.id',
      'campaigns.name',
      'campaigns.code',
      'campaigns.type',
      'target-profiles.description',
      'organizations.name as organizationName',
    )
    .join('organizations', 'organizations.id', 'campaigns.organizationId')
    .join('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
    .whereIn('campaigns.organizationId', organizationIds)
    .orderBy(['organizations.id', 'campaigns.name', 'campaigns.code']);
  return campaigns.map((campaign) => new LtiCampaign(campaign));
}
