import { knex } from '../../../../../db/knex-database-connection.js';
import { fetchPage } from '../../../../../lib/infrastructure/utils/knex-utils.js';
import { SupOrganizationParticipant } from '../../domain/read-models/SupOrganizationParticipant.js';
import { CampaignTypes } from '../../../../../src/prescription/campaign/domain/read-models/CampaignTypes.js';
import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { filterByFullName } from '../../../../../lib/infrastructure/utils/filter-utils.js';

function _setFilters(qb, { search, studentNumber, groups, certificability } = {}) {
  if (search) {
    filterByFullName(qb, search, 'firstName', 'lastName');
  }
  if (studentNumber) {
    qb.whereILike(' studentNumber', `%${studentNumber}%`);
  }
  if (groups) {
    qb.whereIn(
      knex.raw('LOWER("group")'),
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
  const { totalSupParticipants } = await knex
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

  const query = knex
    .with(
      'participants',
      knex
        .select([
          'view-active-organization-learners.id',
          'view-active-organization-learners.lastName',
          'view-active-organization-learners.firstName',
          knex.raw('LOWER("view-active-organization-learners"."firstName") AS "lowerFirstName"'),
          knex.raw('LOWER("view-active-organization-learners"."lastName") AS "lowerLastName"'),
          'view-active-organization-learners.birthdate',
          'view-active-organization-learners.group',
          'view-active-organization-learners.studentNumber',
          'view-active-organization-learners.organizationId',

          knex('campaign-participations')
            .join('campaigns', 'campaigns.id', 'campaignId')
            .select('isCertifiable')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.where('status', CampaignParticipationStatuses.SHARED)
            .and.where('type', CampaignTypes.PROFILES_COLLECTION)
            .and.whereNull('campaign-participations.deletedAt')
            .orderBy('sharedAt', 'desc')
            .limit(1)
            .as('isCertifiable'),

          knex('campaign-participations')
            .join('campaigns', 'campaigns.id', 'campaignId')
            .select('sharedAt')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.where('status', CampaignParticipationStatuses.SHARED)
            .and.where('type', CampaignTypes.PROFILES_COLLECTION)
            .and.whereNull('campaign-participations.deletedAt')
            .orderBy('sharedAt', 'desc')
            .limit(1)
            .as('certifiableAt'),

          knex('campaign-participations')
            .join('campaigns', 'campaigns.id', 'campaignId')
            .select('campaigns.name')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.whereNull('campaign-participations.deletedAt')
            .and.where('isImproved', false)
            .orderBy('campaign-participations.createdAt', 'desc')
            .limit(1)
            .as('campaignName'),

          knex('campaign-participations')
            .join('campaigns', 'campaigns.id', 'campaignId')
            .select('campaign-participations.status')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.whereNull('campaign-participations.deletedAt')
            .and.where('isImproved', false)
            .orderBy('campaign-participations.createdAt', 'desc')
            .limit(1)
            .as('participationStatus'),

          knex('campaign-participations')
            .join('campaigns', 'campaigns.id', 'campaignId')
            .select('campaigns.type')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.whereNull('campaign-participations.deletedAt')
            .and.where('isImproved', false)
            .orderBy('campaign-participations.createdAt', 'desc')
            .limit(1)
            .as('campaignType'),

          knex('campaign-participations')
            .join('campaigns', 'campaigns.id', 'campaignId')
            .select('campaign-participations.createdAt')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.whereNull('campaign-participations.deletedAt')
            .and.where('isImproved', false)
            .orderBy('campaign-participations.createdAt', 'desc')
            .limit(1)
            .as('lastParticipationDate'),
          /**
           * We use knex.raw here since there is no easy way to wrap
           * the query into a coalesce with knex
           */
          knex.raw(`(
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
    .modify(_setFilters, filter);

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
