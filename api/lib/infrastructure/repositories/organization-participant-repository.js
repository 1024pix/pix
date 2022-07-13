const OrganizationParticipant = require('../../domain/read-models/OrganizationParticipant');
const { knex } = require('../../../db/knex-database-connection');
const { fetchPage } = require('../utils/knex-utils');

async function getParticipantsByOrganizationId({ organizationId, page }) {
  const query = knex('organization-learners')
    .select([
      'organization-learners.id',
      'organization-learners.lastName',
      'organization-learners.firstName',
      knex.raw(
        'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER(PARTITION BY "organizationLearnerId") AS "participationCount"'
      ),
    ])
    .join('campaign-participations', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
    .leftJoin('users', 'organization-learners.userId', 'users.id')
    .where({ organizationId })
    .where('users.isAnonymous', '=', false)
    .whereNull('campaign-participations.deletedAt')
    .where('campaign-participations.isImproved', '=', false)
    .orderBy(['organization-learners.lastName', 'organization-learners.firstName', 'organization-learners.id'])
    .distinct('organization-learners.id');

  const { results, pagination } = await fetchPage(query, page);
  const organizationParticipants = results.map((rawParticipant) => new OrganizationParticipant(rawParticipant));
  return { organizationParticipants, pagination };
}

module.exports = {
  getParticipantsByOrganizationId,
};
