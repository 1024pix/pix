import { OrganizationParticipant } from '../../domain/read-models/OrganizationParticipant.js';
import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';
import { filterByFullName } from '../utils/filter-utils.js';
import { CampaignTypes } from '../../domain/models/CampaignTypes.js';
import { CampaignParticipationStatuses } from '../../domain/models/CampaignParticipationStatuses.js';

async function getParticipantsByOrganizationId({ organizationId, page, filters = {}, sort = {} }) {
  const { count } = await knex
    .select(knex.raw('COUNT(DISTINCT "view-active-organization-learners"."id")'))
    .from('view-active-organization-learners')
    .join('users', function () {
      this.on('users.id', 'view-active-organization-learners.userId').andOn(
        'users.isAnonymous',
        knex.raw('IS'),
        knex.raw('false')
      );
    })
    .join(
      'campaign-participations',
      'campaign-participations.organizationLearnerId',
      'view-active-organization-learners.id'
    )
    .where({ organizationId: organizationId, isDisabled: false })
    .where({ 'campaign-participations.deletedAt': null })
    .first();
  const totalParticipants = count ?? 0;

  const orderByClause = [
    'view-active-organization-learners.lastName',
    'view-active-organization-learners.firstName',
    'view-active-organization-learners.id',
  ];
  if (sort?.participationCount) {
    orderByClause.unshift({
      column: 'participationCount',
      order: sort.participationCount === 'desc' ? 'desc' : 'asc',
    });
  }
  if (sort?.lastnameSort) {
    orderByClause.unshift({
      column: 'view-active-organization-learners.lastName',
      order: sort.lastnameSort === 'desc' ? 'desc' : 'asc',
    });
  }

  const query = knex
    .with('subquery', (qb) => _buildIsCertifiable(qb, organizationId))
    .select([
      'view-active-organization-learners.id',
      'view-active-organization-learners.lastName',
      'view-active-organization-learners.firstName',
      'subquery.isCertifiable',
      'subquery.certifiableAt',
      knex.raw(
        'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER(PARTITION BY "view-active-organization-learners"."id") AS "participationCount"'
      ),
      knex.raw(
        'max("campaign-participations"."createdAt") OVER(PARTITION BY "view-active-organization-learners"."id") AS "lastParticipationDate"'
      ),
      knex.raw(
        'FIRST_VALUE("name") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignName"'
      ),
      knex.raw(
        'FIRST_VALUE("type") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignType"'
      ),
      knex.raw(
        'FIRST_VALUE("campaign-participations"."status") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "participationStatus"'
      ),
    ])
    .from('view-active-organization-learners')
    .join(
      'campaign-participations',
      'campaign-participations.organizationLearnerId',
      'view-active-organization-learners.id'
    )
    .join('campaigns', function () {
      this.on('campaign-participations.campaignId', 'campaigns.id');
      this.on('campaigns.organizationId', organizationId);
    })
    .leftJoin('subquery', 'subquery.organizationLearnerId', 'view-active-organization-learners.id')
    .leftJoin('users', 'view-active-organization-learners.userId', 'users.id')
    .where('view-active-organization-learners.organizationId', organizationId)
    .where('users.isAnonymous', '=', false)
    .whereNull('campaign-participations.deletedAt')
    .where('campaign-participations.isImproved', '=', false)
    .orderBy(orderByClause)
    .distinct('view-active-organization-learners.id')
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
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName'
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
    .distinct('view-active-organization-learners.id')
    .select([
      'view-active-organization-learners.id as organizationLearnerId',
      knex.raw(
        'FIRST_VALUE("isCertifiable") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "isCertifiable"'
      ),
      knex.raw(
        'FIRST_VALUE("sharedAt") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "certifiableAt"'
      ),
    ])
    .from('view-active-organization-learners')
    .join(
      'campaign-participations',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId'
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.status', CampaignParticipationStatuses.SHARED)
    .where('campaigns.type', CampaignTypes.PROFILES_COLLECTION)
    .where('view-active-organization-learners.organizationId', organizationId)
    .where('campaigns.organizationId', organizationId)
    .where('campaign-participations.deletedAt', null);
}

export { getParticipantsByOrganizationId };
