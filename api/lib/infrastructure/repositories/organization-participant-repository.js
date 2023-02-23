const OrganizationParticipant = require('../../domain/read-models/OrganizationParticipant.js');
const { knex } = require('../../../db/knex-database-connection.js');
const { fetchPage } = require('../utils/knex-utils.js');
const { filterByFullName } = require('../utils/filter-utils.js');
const CampaignTypes = require('../../domain/models/CampaignTypes.js');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses.js');

async function getParticipantsByOrganizationId({ organizationId, page, filters = {}, sort = {} }) {
  const { count } = await knex
    .select(knex.raw('COUNT(DISTINCT "organization-learners"."id")'))
    .from('organization-learners')
    .join('users', function () {
      this.on('users.id', 'organization-learners.userId').andOn('users.isAnonymous', knex.raw('IS'), knex.raw('false'));
    })
    .join('campaign-participations', 'campaign-participations.organizationLearnerId', 'organization-learners.id')
    .where({ organizationId: organizationId, isDisabled: false })
    .where({ 'campaign-participations.deletedAt': null })
    .first();
  const totalParticipants = count ?? 0;

  const orderByClause = [
    'organization-learners.lastName',
    'organization-learners.firstName',
    'organization-learners.id',
  ];
  if (sort?.participationCount) {
    orderByClause.unshift({
      column: 'participationCount',
      order: sort.participationCount === 'desc' ? 'desc' : 'asc',
    });
  }
  if (sort?.lastnameSort) {
    orderByClause.unshift({
      column: 'organization-learners.lastName',
      order: sort.lastnameSort === 'desc' ? 'desc' : 'asc',
    });
  }

  const query = knex
    .with('subquery', (qb) => _buildIsCertifiable(qb, organizationId))
    .select([
      'organization-learners.id',
      'organization-learners.lastName',
      'organization-learners.firstName',
      'subquery.isCertifiable',
      'subquery.certifiableAt',
      knex.raw(
        'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER(PARTITION BY "organization-learners"."id") AS "participationCount"'
      ),
      knex.raw(
        'max("campaign-participations"."createdAt") OVER(PARTITION BY "organization-learners"."id") AS "lastParticipationDate"'
      ),
      knex.raw(
        'FIRST_VALUE("name") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignName"'
      ),
      knex.raw(
        'FIRST_VALUE("type") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignType"'
      ),
      knex.raw(
        'FIRST_VALUE("campaign-participations"."status") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "participationStatus"'
      ),
    ])
    .from('organization-learners')
    .join('campaign-participations', 'campaign-participations.organizationLearnerId', 'organization-learners.id')
    .join('campaigns', function () {
      this.on('campaign-participations.campaignId', 'campaigns.id');
      this.on('campaigns.organizationId', organizationId);
    })
    .leftJoin('subquery', 'subquery.organizationLearnerId', 'organization-learners.id')
    .leftJoin('users', 'organization-learners.userId', 'users.id')
    .where('organization-learners.organizationId', organizationId)
    .where('users.isAnonymous', '=', false)
    .whereNull('campaign-participations.deletedAt')
    .where('campaign-participations.isImproved', '=', false)
    .orderBy(orderByClause)
    .distinct('organization-learners.id')
    .modify(_filterBySearch, filters)
    .modify(_filterByCertificability, filters);

  const { results, pagination } = await fetchPage(query, page);
  const organizationParticipants = results.map((rawParticipant) => new OrganizationParticipant(rawParticipant));
  return { organizationParticipants, meta: { ...pagination, participantCount: totalParticipants } };
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

function _filterByCertificability(queryBuilder, filters) {
  if (filters.certificability) {
    queryBuilder.where(function (query) {
      query.whereInArray('subquery.isCertifiable', filters.certificability);
      if (filters.certificability.includes(null)) {
        query.orWhereRaw('"subquery"."isCertifiable" IS NULL');
      }
    });
  }
}

function _buildIsCertifiable(queryBuilder, organizationId) {
  queryBuilder
    .distinct('organization-learners.id')
    .select([
      'organization-learners.id as organizationLearnerId',
      knex.raw(
        'FIRST_VALUE("isCertifiable") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "isCertifiable"'
      ),
      knex.raw(
        'FIRST_VALUE("sharedAt") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "certifiableAt"'
      ),
    ])
    .from('organization-learners')
    .join('campaign-participations', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.status', CampaignParticipationStatuses.SHARED)
    .where('campaigns.type', CampaignTypes.PROFILES_COLLECTION)
    .where('organization-learners.organizationId', organizationId)
    .where('campaigns.organizationId', organizationId)
    .where('campaign-participations.deletedAt', null);
}

module.exports = {
  getParticipantsByOrganizationId,
};
