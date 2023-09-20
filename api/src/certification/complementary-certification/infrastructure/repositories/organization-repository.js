import { knex } from '../../../../../db/knex-database-connection.js';

const getOrganizationUserEmailByCampaignTargetProfileId = async function (targetProfileId) {
  return knex('campaigns')
    .innerJoin('organizations', 'campaigns.organizationId', 'organizations.id')
    .innerJoin('memberships', 'organizations.id', 'memberships.organizationId')
    .innerJoin('users', 'users.id', 'memberships.userId')
    .where({ targetProfileId })
    .distinct()
    .pluck('users.email');
};

export { getOrganizationUserEmailByCampaignTargetProfileId };
