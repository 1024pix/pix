import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

export async function getOrganizationUserEmailByCampaignTargetProfileId(targetProfileId) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn('campaigns')
    .innerJoin('organizations', 'campaigns.organizationId', 'organizations.id')
    .innerJoin('memberships', 'organizations.id', 'memberships.organizationId')
    .innerJoin('users', 'users.id', 'memberships.userId')
    .where({ targetProfileId })
    .distinct()
    .pluck('users.email');
}
