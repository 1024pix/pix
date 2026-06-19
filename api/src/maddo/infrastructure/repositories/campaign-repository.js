import * as campaignAPI from '../../../prescription/campaign/application/api/campaigns-api.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Campaign } from '../../domain/models/Campaign.js';

export async function findByOrganizationId(organizationId, page, locale) {
  const campaigns = await campaignAPI.findAllForOrganization({
    organizationId,
    withCoverRate: false,
    page,
    locale,
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
