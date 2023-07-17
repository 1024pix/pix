import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';
import { SupOrganizationParticipant } from '../../domain/read-models/SupOrganizationParticipant.js';
import { CampaignTypes } from '../../domain/models/CampaignTypes.js';
import { CampaignParticipationStatuses } from '../../domain/models/CampaignParticipationStatuses.js';
import { filterByFullName } from '../utils/filter-utils.js';

function _setFilters(qb, { search, studentNumber, groups, certificability } = {}) {
  if (search) {
    filterByFullName(
      qb,
      search,
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
    );
  }
  if (studentNumber) {
    qb.whereILike('view-active-organization-learners.studentNumber', `%${studentNumber}%`);
  }
  if (groups) {
    qb.whereIn(
      knex.raw('LOWER("view-active-organization-learners"."group")'),
      groups.map((group) => group.toLowerCase()),
    );
  }
  if (certificability) {
    qb.where(function (query) {
      query.whereInArray('subquery.isCertifiable', certificability);
      if (certificability.includes(null)) {
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
        'FIRST_VALUE("isCertifiable") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "isCertifiable"',
      ),
      knex.raw(
        'FIRST_VALUE("sharedAt") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "certifiableAt"',
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

const findPaginatedFilteredSupParticipants = async function ({ organizationId, filter, page = {}, sort = {} }) {
  const { totalSupParticipants } = await knex
    .count('id', { as: 'totalSupParticipants' })
    .from('view-active-organization-learners')
    .where({ organizationId: organizationId, isDisabled: false })
    .first();

  const orderByClause = [
    'view-active-organization-learners.lastName',
    'view-active-organization-learners.firstName',
    'view-active-organization-learners.id',
  ];
  if (sort?.participationCount) {
    orderByClause.unshift({
      column: 'participationCount',
      order: sort.participationCount == 'desc' ? 'desc' : 'asc',
    });
  }
  if (sort?.lastnameSort) {
    orderByClause.unshift({
      column: 'view-active-organization-learners.lastName',
      order: sort.lastnameSort == 'desc' ? 'desc' : 'asc',
    });
  }

  const query = knex
    .with('subquery', (qb) => _buildIsCertifiable(qb, organizationId))
    .distinct('view-active-organization-learners.id')
    .select([
      'view-active-organization-learners.id',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
      knex.raw('LOWER("view-active-organization-learners"."firstName") AS "lowerFirstName"'),
      knex.raw('LOWER("view-active-organization-learners"."lastName") AS "lowerLastName"'),
      'view-active-organization-learners.birthdate',
      'view-active-organization-learners.group',
      'view-active-organization-learners.studentNumber',
      'view-active-organization-learners.organizationId',
      'subquery.isCertifiable',
      'subquery.certifiableAt',
      knex.raw(
        'FIRST_VALUE("name") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignName"',
      ),
      knex.raw(
        'FIRST_VALUE("campaign-participations"."status") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "participationStatus"',
      ),
      knex.raw(
        'FIRST_VALUE("type") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignType"',
      ),
      knex.raw(
        'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER(PARTITION BY "view-active-organization-learners"."id") AS "participationCount"',
      ),
      knex.raw(
        'max("campaign-participations"."createdAt") OVER(PARTITION BY "view-active-organization-learners"."id") AS "lastParticipationDate"',
      ),
    ])
    .from('view-active-organization-learners')
    .leftJoin('subquery', 'subquery.organizationLearnerId', 'view-active-organization-learners.id')
    .leftJoin('campaign-participations', function () {
      this.on('campaign-participations.organizationLearnerId', 'view-active-organization-learners.id')
        .andOn('campaign-participations.isImproved', '=', knex.raw('false'))
        .andOn('campaign-participations.deletedAt', knex.raw('is'), knex.raw('null'));
    })
    .leftJoin('campaigns', function () {
      this.on('campaigns.id', 'campaign-participations.campaignId').andOn(
        'campaigns.organizationId',
        'view-active-organization-learners.organizationId',
      );
    })
    .where('view-active-organization-learners.isDisabled', false)
    .where('view-active-organization-learners.organizationId', organizationId)
    .modify(_setFilters, filter)
    .orderBy(orderByClause);

  const { results, pagination } = await fetchPage(query, page);

  const supOrganizationParticipants = results.map((result) => {
    return new SupOrganizationParticipant({ ...result });
  });
  return {
    data: supOrganizationParticipants,
    meta: { ...pagination, participantCount: totalSupParticipants },
  };
};

export { findPaginatedFilteredSupParticipants };
