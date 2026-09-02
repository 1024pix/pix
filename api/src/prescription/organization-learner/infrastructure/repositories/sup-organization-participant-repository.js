import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../src/prescription/shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { filterByFullName } from '../../../../shared/infrastructure/utils/filter-utils.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { SupOrganizationParticipant } from '../../domain/read-models/SupOrganizationParticipant.js';

function _setFilters(qb, { search, studentNumber, groups, certificability } = {}, knexConn) {
  if (search) {
    filterByFullName(qb, search, 'firstName', 'lastName');
  }
  if (studentNumber) {
    qb.whereILike(' studentNumber', `%${studentNumber}%`);
  }
  if (groups) {
    qb.whereIn(
      knexConn.raw('LOWER("group")'),
      groups.map((group) => group.toLowerCase()),
    );
  }
  if (certificability) {
    qb.where(function (query) {
      query.whereInArray('isCertifiable', certificability);
      if (certificability.includes(null)) {
        query.orWhereRaw('"isCertifiable" IS NULL');
      }
    });
  }
}

const findPaginatedFilteredSupParticipants = async function ({ organizationId, filter, page = {}, sort = {} }) {
  const knexConn = DomainTransaction.getConnection();
  const { totalSupParticipants } = await knexConn
    .count('id', { as: 'totalSupParticipants' })
    .from('view-active-organization-learners')
    .where({ organizationId: organizationId, isDisabled: false })
    .first();

  const orderByClause = ['lastName', 'firstName', 'id'];
  if (sort?.participationCount) {
    orderByClause.unshift({
      column: 'participationCount',
      order: sort.participationCount == 'desc' ? 'desc' : 'asc',
    });
  }
  if (sort?.lastnameSort) {
    orderByClause.unshift({
      column: 'lastName',
      order: sort.lastnameSort == 'desc' ? 'desc' : 'asc',
    });
  }

  if (sort?.latestParticipationSort) {
    orderByClause.unshift({
      column: 'lastParticipationDate',
      order: sort.latestParticipationSort === 'desc' ? 'desc' : 'asc',
    });
  }

  const query = knexConn
    .with(
      'participants',
      knexConn
        .select([
          'view-active-organization-learners.id',
          'view-active-organization-learners.lastName',
          'view-active-organization-learners.firstName',
          knexConn.raw('LOWER("view-active-organization-learners"."firstName") AS "lowerFirstName"'),
          knexConn.raw('LOWER("view-active-organization-learners"."lastName") AS "lowerLastName"'),
          'view-active-organization-learners.birthdate',
          'view-active-organization-learners.group',
          'view-active-organization-learners.studentNumber',
          'view-active-organization-learners.organizationId',

          knexConn('campaign-participations')
            .join('campaigns', 'campaigns.id', 'campaignId')
            .select('isCertifiable')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.where('status', CampaignParticipationStatuses.SHARED)
            .and.where('type', CampaignTypes.PROFILES_COLLECTION)
            .and.whereNull('campaign-participations.deletedAt')
            .orderBy('sharedAt', 'desc')
            .limit(1)
            .as('isCertifiable'),

          knexConn('campaign-participations')
            .join('campaigns', 'campaigns.id', 'campaignId')
            .select('sharedAt')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.where('status', CampaignParticipationStatuses.SHARED)
            .and.where('type', CampaignTypes.PROFILES_COLLECTION)
            .and.whereNull('campaign-participations.deletedAt')
            .orderBy('sharedAt', 'desc')
            .limit(1)
            .as('certifiableAt'),

          knexConn('campaign-participations')
            .join('campaigns', 'campaigns.id', 'campaignId')
            .select('campaigns.name')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.whereNull('campaign-participations.deletedAt')
            .and.where('isImproved', false)
            .orderBy('campaign-participations.createdAt', 'desc')
            .limit(1)
            .as('campaignName'),

          knexConn('campaign-participations')
            .join('campaigns', 'campaigns.id', 'campaignId')
            .select('campaign-participations.status')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.whereNull('campaign-participations.deletedAt')
            .and.where('isImproved', false)
            .orderBy('campaign-participations.createdAt', 'desc')
            .limit(1)
            .as('participationStatus'),

          knexConn('campaign-participations')
            .join('campaigns', 'campaigns.id', 'campaignId')
            .select('campaigns.type')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.whereNull('campaign-participations.deletedAt')
            .and.where('isImproved', false)
            .orderBy('campaign-participations.createdAt', 'desc')
            .limit(1)
            .as('campaignType'),

          knexConn('campaign-participations')
            .join('campaigns', 'campaigns.id', 'campaignId')
            .select('campaign-participations.createdAt')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.whereNull('campaign-participations.deletedAt')
            .and.where('isImproved', false)
            .orderBy('campaign-participations.createdAt', 'desc')
            .limit(1)
            .as('lastParticipationDate'),
          /**
           * We use knexConn.raw here since there is no easy way to wrap
           * the query into a coalesce with knexConn
           */
          knexConn.raw(`(
            coalesce (
              (
                select count("id") as "participationCount"
                from "campaign-participations"
                where
                  "organizationLearnerId" = "view-active-organization-learners"."id"
                  and "isImproved" = false
                  and "deletedAt" is null
                group by
                  "organizationLearnerId"
              ), 0
            )
          )
          as "participationCount"
          `),
        ])
        .from('view-active-organization-learners')
        .leftJoin('users', function () {
          this.on('view-active-organization-learners.userId', 'users.id');
        })
        .where('view-active-organization-learners.organizationId', organizationId)
        .and.where('view-active-organization-learners.isDisabled', false),
    )
    .select('*')
    .from('participants')
    .orderBy(orderByClause)
    .modify(_setFilters, filter, knexConn);

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });
  const supOrganizationParticipants = results.map((result) => {
    return new SupOrganizationParticipant({ ...result });
  });
  return {
    data: supOrganizationParticipants,
    meta: { ...pagination, participantCount: totalSupParticipants },
  };
};

export { findPaginatedFilteredSupParticipants };
