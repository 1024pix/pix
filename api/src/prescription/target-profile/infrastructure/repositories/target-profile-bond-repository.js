import { knex } from '../../../../../db/knex-database-connection.js';

const update = async function (targetProfile) {
  const results = await knex('target-profile-shares')
    .where('targetProfileId', targetProfile.id)
    .whereIn('organizationId', targetProfile.organizationIdsToDetach)
    .del()
    .returning('organizationId');
  return results.map(({ organizationId }) => organizationId);
};

export { update };
