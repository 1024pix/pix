const OrganizationParticipant = require('../../domain/read-models/OrganizationParticipant');
const { knex } = require('../../../db/knex-database-connection');
const { fetchPage } = require('../utils/knex-utils');
const { filterByFullName } = require('../utils/filter-utils');

async function getParticipantsByOrganizationId({ organizationId, page, filters = {} }) {
  const query = knex('organization-learners')
    .select([
      'organization-learners.id',
      'organization-learners.lastName',
      'organization-learners.firstName',
      knex.raw(
        'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER(PARTITION BY "organizationLearnerId") AS "participationCount"'
      ),
      knex.raw(
        'max("campaign-participations"."createdAt") OVER(PARTITION BY "organizationLearnerId") AS "lastParticipationDate"'
      ),
      knex.raw(
        'FIRST_VALUE("name") OVER(PARTITION BY "organizationLearnerId" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignName"'
      ),
      knex.raw(
        'FIRST_VALUE("type") OVER(PARTITION BY "organizationLearnerId" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignType"'
      ),
      knex.raw(
        'FIRST_VALUE("campaign-participations"."status") OVER(PARTITION BY "organizationLearnerId" ORDER BY "campaign-participations"."createdAt" DESC) AS "participationStatus"'
      ),
    ])
    .join('campaign-participations', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
    .join('campaigns', function () {
      this.on('campaign-participations.campaignId', 'campaigns.id');
      this.on('campaigns.organizationId', organizationId);
    })
    .leftJoin('users', 'organization-learners.userId', 'users.id')
    .where('organization-learners.organizationId', organizationId)
    .where('users.isAnonymous', '=', false)
    .whereNull('campaign-participations.deletedAt')
    .where('campaign-participations.isImproved', '=', false)
    .orderBy(['organization-learners.lastName', 'organization-learners.firstName', 'organization-learners.id'])
    .distinct('organization-learners.id')
    .modify(_filterBySearch, filters);

  const { results, pagination } = await fetchPage(query, page);
  const organizationParticipants = results.map((rawParticipant) => new OrganizationParticipant(rawParticipant));
  return { organizationParticipants, pagination };
}

function _filterBySearch(queryBuilder, filters) {
  if (filters.fullName) {
    filterByFullName(
      queryBuilder,
      filters.fullName,
      'organization-learners.firstName',
      'organization-learners.lastName'
    );
  }
}
module.exports = {
  getParticipantsByOrganizationId,
};
