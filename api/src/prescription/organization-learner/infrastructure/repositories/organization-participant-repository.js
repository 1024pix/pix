import { OrganizationParticipant } from '../../domain/read-models/OrganizationParticipant.js';
import { knex } from '../../../../../db/knex-database-connection.js';
import { fetchPage } from '../../../../../lib/infrastructure/utils/knex-utils.js';
import { filterByFullName } from '../../../../../lib/infrastructure/utils/filter-utils.js';
import { CampaignTypes } from '../../../../../lib/domain/models/CampaignTypes.js';
import { CampaignParticipationStatuses } from '../../../../../lib/domain/models/CampaignParticipationStatuses.js';

async function getParticipantsByOrganizationId({ organizationId, page, filters = {}, sort = {} }) {
  const { count } = await knex
    .select(knex.raw('COUNT(DISTINCT "view-active-organization-learners"."id")'))
    .from('view-active-organization-learners')
    .join('users', function () {
      this.on('users.id', 'view-active-organization-learners.userId').andOn(
        'users.isAnonymous',
        knex.raw('IS'),
        knex.raw('false'),
      );
    })
    .join('campaign-participations', function () {
      this.on('campaign-participations.organizationLearnerId', 'view-active-organization-learners.id')
        .andOn('campaign-participations.userId', 'view-active-organization-learners.userId')
        .andOnVal('campaign-participations.deletedAt', knex.raw('IS'), knex.raw('NULL'));
    })
    .where({ organizationId: organizationId, isDisabled: false })
    .first();
  const totalParticipants = count ?? 0;

  const orderByClause = [
    'view-active-organization-learners.lastName',
    'view-active-organization-learners.firstName',
    'view-active-organization-learners.id',
  ];
  if (sort.participationCount) {
    orderByClause.unshift({
      column: 'participationCount',
      order: sort.participationCount === 'desc' ? 'desc' : 'asc',
    });
  }
  if (sort.lastnameSort) {
    orderByClause.unshift({
      column: 'view-active-organization-learners.lastName',
      order: sort.lastnameSort === 'desc' ? 'desc' : 'asc',
    });
  }

  if (sort.latestParticipationOrder) {
    orderByClause.unshift({
      column: 'lastParticipationDate',
      order: sort.latestParticipationOrder === 'desc' ? 'desc' : 'asc',
    });
  }

  const query = knex
    .with('subquery', (qb) => _buildIsCertifiable(qb, organizationId))
    .select([
      'view-active-organization-learners.id',
      'view-active-organization-learners.lastName',
      'view-active-organization-learners.firstName',
      'subquery.isCertifiableFromCampaign',
      'subquery.certifiableAtFromCampaign',
      'view-active-organization-learners.isCertifiable as isCertifiableFromLearner',
      'view-active-organization-learners.certifiableAt as certifiableAtFromLearner',
      knex.raw(
        'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER(PARTITION BY "view-active-organization-learners"."id") AS "participationCount"',
      ),
      knex.raw(
        'max("campaign-participations"."createdAt") OVER(PARTITION BY "view-active-organization-learners"."id") AS "lastParticipationDate"',
      ),
      knex.raw(
        'FIRST_VALUE("name") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignName"',
      ),
      knex.raw(
        'FIRST_VALUE("type") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignType"',
      ),
      knex.raw(
        'FIRST_VALUE("campaign-participations"."status") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "participationStatus"',
      ),
    ])
    .from('view-active-organization-learners')
    .join('campaign-participations', function () {
      this.on('campaign-participations.organizationLearnerId', 'view-active-organization-learners.id')
        .andOnVal('campaign-participations.isImproved', false)
        .andOnVal('campaign-participations.deletedAt', knex.raw('IS'), knex.raw('NULL'))
        .andOn('campaign-participations.userId', 'view-active-organization-learners.userId');
    })
    .join('campaigns', function () {
      this.on('campaign-participations.campaignId', 'campaigns.id').andOnVal(
        'campaigns.organizationId',
        organizationId,
      );
    })
    .leftJoin('subquery', 'subquery.organizationLearnerId', 'view-active-organization-learners.id')
    .join('users', function () {
      this.on('view-active-organization-learners.userId', 'users.id').andOnVal('users.isAnonymous', false);
    })
    .where('view-active-organization-learners.organizationId', organizationId)
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
      'view-active-organization-learners.lastName',
    );
  }
}

function _filterByCertificability(queryBuilder, filters) {
  if (filters.certificability) {
    queryBuilder.where(function (query) {
      query.whereInArray(
        knex.raw(
          'case when "certifiableAtFromCampaign" > "view-active-organization-learners"."certifiableAt" OR "view-active-organization-learners"."certifiableAt" IS NULL then "isCertifiableFromCampaign" else "view-active-organization-learners"."isCertifiable" end',
        ),
        filters.certificability,
      );
      if (filters.certificability.includes(null)) {
        query.orWhere(function (query) {
          query.whereNull('certifiableAtFromCampaign').whereNull('view-active-organization-learners.certifiableAt');
        });
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
        'FIRST_VALUE("campaign-participations"."isCertifiable") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "isCertifiableFromCampaign"',
      ),
      knex.raw(
        'FIRST_VALUE("campaign-participations"."sharedAt") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "certifiableAtFromCampaign"',
      ),
    ])
    .from('view-active-organization-learners')
    .join(
      'campaign-participations',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.status', CampaignParticipationStatuses.SHARED)
    .where('campaigns.type', CampaignTypes.PROFILES_COLLECTION)
    .where('view-active-organization-learners.organizationId', organizationId)
    .where('campaigns.organizationId', organizationId)
    .where('campaign-participations.deletedAt', null);
}

export { getParticipantsByOrganizationId };
