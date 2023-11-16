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
    .with(
      'participants',
      knex
        .select([
          'view-active-organization-learners.id',
          'view-active-organization-learners.lastName',
          'view-active-organization-learners.firstName',
          knex.raw(`
        (select "isCertifiable"
        from "campaign-participations", "campaigns"
        where "organizationLearnerId" = "view-active-organization-learners"."id"
          and "campaign-participations"."campaignId" = "campaigns"."id"
          and "status" = '${CampaignParticipationStatuses.SHARED}'
          and "type" = '${CampaignTypes.PROFILES_COLLECTION}'
          and "campaign-participations"."deletedAt" is null
        order by "sharedAt" desc
        Limit 1) as "isCertifiable"
      `),
          knex.raw(`
        (select "sharedAt"
        from "campaign-participations", "campaigns"
        where "organizationLearnerId" = "view-active-organization-learners"."id"
          and "campaign-participations"."campaignId" = "campaigns"."id"
          and "status" = '${CampaignParticipationStatuses.SHARED}'
          and "type" = '${CampaignTypes.PROFILES_COLLECTION}'
          and "campaign-participations"."deletedAt" is null
        order by "sharedAt" desc
        Limit 1) as "certifiableAt"
      `),
          // knex
          //   .select(knex.raw(`"isCertifiable" as isCertifiableFromCampaign`))
          //   .from(knex.raw('campaign-participations', 'campaigns'))
          //   .whereRaw(`"organizationLearnerId" = "view-active-organization-learners"."id"`)
          //   .andWhereRaw(`"campaign-participations"."campaignId" = "campaigns"."id"`)
          //   .andWhere('status', CampaignParticipationStatuses.SHARED)
          //   .andWhere('campaignType', CampaignTypes.PROFILES_COLLECTION)
          //   .andWhereRaw(`"campaign-participations"."deletedAt" IS NULL`)
          //   .orderBy('sharedAt')
          //   .limit(1),
          // knex
          //   .select(knex.raw(`"sharedAt" as certifiableAtFromCampaign`))
          //   .from(knex.raw('campaign-participations', 'campaigns'))
          //   .whereRaw(`"organizationLearnerId" = "view-active-organization-learners"."id"`)
          //   .andWhereRaw(`"campaign-participations"."campaignId" = "campaigns"."id"`)
          //   .andWhere('status', CampaignParticipationStatuses.SHARED)
          //   .andWhere('campaignType', CampaignTypes.PROFILES_COLLECTION)
          //   .andWhereRaw(`"campaign-participations"."deletedAt" IS NULL`)
          //   .orderBy('sharedAt')
          //   .limit(1),
          knex.raw(`
        (select count(*) as "participationCount"
        from "campaign-participations"
        where "campaign-participations"."organizationLearnerId" = "view-active-organization-learners"."id"
        group by "campaign-participations"."organizationLearnerId")
      `),
          knex.raw(`
        (select "campaign-participations"."createdAt" as "lastParticipationDate"
        from "campaign-participations", "campaigns"
        where "organizationLearnerId" = "view-active-organization-learners"."id"
          and "campaigns"."id" = "campaign-participations"."campaignId"
        order by "campaign-participations"."createdAt" desc NULLS LAST
        Limit 1)
      `),
          knex.raw(`
        (select  "campaigns"."name" as "campaignName"
        from "campaign-participations", "campaigns"
        where "organizationLearnerId" = "view-active-organization-learners"."id"
          and "campaigns"."id" = "campaign-participations"."campaignId"
        order by "campaign-participations"."createdAt" desc NULLS LAST
        Limit 1)
      `),
          knex.raw(`
        (select "campaigns"."type" as "campaignType"
        from "campaign-participations", "campaigns"
        where "organizationLearnerId" = "view-active-organization-learners"."id"
          and "campaigns"."id" = "campaign-participations"."campaignId"
        order by "campaign-participations"."createdAt" desc NULLS LAST
        Limit 1)
      `),
          knex.raw(`
        (select "campaign-participations"."status" as "participationStatus"
        from "campaign-participations", "campaigns"
        where "organizationLearnerId" = "view-active-organization-learners"."id"
          and "campaigns"."id" = "campaign-participations"."campaignId"
        order by "campaign-participations"."createdAt" desc NULLS LAST
        Limit 1)
      `),
        ])
        .from('view-active-organization-learners')
        .join('users', function () {
          this.on('view-active-organization-learners.userId', 'users.id').andOnVal('users.isAnonymous', false);
        })
        .where('view-active-organization-learners.organizationId', organizationId)
        .orderBy(orderByClause),
    )
    .select('*')
    .from('participants')
    .modify(_filterBySearch, filters)
    .modify(_filterByCertificability, filters);

  const { results, pagination } = await fetchPage(query, page);
  const organizationParticipants = results.map((rawParticipant) => new OrganizationParticipant(rawParticipant));
  return { organizationParticipants, meta: { ...pagination, participantCount: totalParticipants } };
}

function _filterBySearch(queryBuilder, filters) {
  if (filters.fullName) {
    filterByFullName(queryBuilder, filters.fullName, 'participants.firstName', 'participants.lastName');
  }
}

function _filterByCertificability(queryBuilder, filters) {
  if (filters.certificability) {
    queryBuilder.where(function (query) {
      query.whereInArray('participants.isCertifiable', filters.certificability);
      if (filters.certificability.includes(null)) {
        query.orWhereRaw('"participants"."isCertifiable" IS NULL');
      }
    });
  }
}

export { getParticipantsByOrganizationId };
