import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Organization } from '../../domain/models/Organization.js';

export async function findIdsByTagNames(tagNames) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .pluck('organization-tags.organizationId')
    .from('organization-tags')
    .join('tags', 'tags.id', 'organization-tags.tagId')
    .whereIn('tags.name', tagNames)
    .groupBy('organization-tags.organizationId')
    .havingRaw('count(*) = ?', [tagNames.length])
    .orderBy('organization-tags.organizationId');
}

export async function findIdentityProviderForCampaignsByCampaignId(campaignId) {
  const knexConn = DomainTransaction.getConnection();
  const { identityProviderForCampaigns } = await knexConn
    .select('organizations.identityProviderForCampaigns')
    .from('organizations')
    .join('campaigns', 'campaigns.organizationId', 'organizations.id')
    .where('campaigns.id', campaignId)
    .first();

  return identityProviderForCampaigns;
}

export async function findByIds(organizationIds) {
  const knexConn = DomainTransaction.getConnection();
  const rawOrganizations = await knexConn
    .select('id', 'name', 'externalId')
    .from('organizations')
    .whereIn('id', organizationIds)
    .orderBy('id');

  return rawOrganizations.map(toDomain);
}

function toDomain(rawOrganization) {
  return new Organization(rawOrganization);
}
