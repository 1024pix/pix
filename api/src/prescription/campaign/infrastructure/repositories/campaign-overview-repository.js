import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CampaignOverview } from '../../domain/read-models/CampaignOverview.js';

function baseQuery(knexConn) {
  return knexConn('campaigns')
    .select(
      'campaigns.id',
      'campaigns.name',
      'campaigns.code',
      'campaigns.type',
      'target-profiles.description',
      'organizations.name as organizationName',
      'organizationId',
      'targetProfileId',
    )
    .join('organizations', 'organizations.id', 'campaigns.organizationId')
    .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
    .whereNull('campaigns.deletedAt')
    .whereNull('campaigns.archivedAt');
}

export async function getAllByOrganizationIds({ organizationIds }) {
  const knexConn = DomainTransaction.getConnection();
  const campaigns = await baseQuery(knexConn)
    .whereIn('campaigns.organizationId', organizationIds)
    .orderBy(['organizations.id', 'campaigns.name', 'campaigns.code']);

  return campaigns.map((campaign) => new CampaignOverview(campaign));
}

export async function get({ campaignId }) {
  const knexConn = DomainTransaction.getConnection();
  const campaign = await baseQuery(knexConn).where('campaigns.id', campaignId).first();

  return campaign ? new CampaignOverview(campaign) : null;
}
