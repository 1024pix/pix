import { knex } from '../../../../../db/knex-database-connection.js';

const getOrganizationUserEmailsFromTargetProfileId = async function ({ targetProfileId }) {
  return knex('campaigns')
    .innerJoin('organization', 'campaigns.organizationId', 'organization.id')
    .innerJoin('memberships', 'organization.id', 'memberships.organizationId')
    .innerJoin('users', 'users.id', 'memberships.userId')
    .where({ targetProfileId })
    .pluck('email');
};

export { getOrganizationUserEmailsFromTargetProfileId };
