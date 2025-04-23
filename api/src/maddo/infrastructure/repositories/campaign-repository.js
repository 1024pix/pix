import { knex } from '../../../../db/knex-database-connection.js';
import * as campaignAPI from '../../../prescription/campaign/application/api/campaigns-api.js';
import { Campaign } from '../../domain/models/Campaign.ts';

export async function findByOrganizationId(organizationId) {
  const campaigns = await campaignAPI.findAllForOrganization({
    organizationId,
    withCoverRate: true,
    page: { size: 1000, number: 1 },
  });
  return campaigns.models.map(toDomain);
}

export async function getOrganizationId(campaignId) {
  const [organizationId] = await knex.pluck('organizationId').from('campaigns').where('id', campaignId);
  return organizationId;
}

function toDomain(rawCampaign) {
  return new Campaign(rawCampaign);
}
