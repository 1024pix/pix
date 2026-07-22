import * as campaignAPI from '../../../prescription/campaign/application/api/campaigns-api.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Campaign } from '../../domain/models/Campaign.js';

export async function findByOrganizationId(organizationId, page) {
  const campaigns = await campaignAPI.findAllSummariesForOrganization({
    organizationId,
    withTargetProfileName: true,
    withArchived: false,
    page,
  });
  return {
    page: toPage(campaigns.meta),
    campaigns: campaigns.models.map(toDomain),
  };
}

export async function getOrganizationId(campaignId) {
  const knexConn = DomainTransaction.getConnection();

  const [organizationId] = await knexConn.pluck('organizationId').from('campaigns').where('id', campaignId);
  return organizationId;
}

function toDomain(rawCampaign) {
  return new Campaign(rawCampaign);
}

function toPage(meta) {
  return { number: meta.page, size: meta.pageSize, count: meta.pageCount };
}
