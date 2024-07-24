import { knex } from '../../../../../db/knex-database-connection.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../src/prescription/shared/domain/constants.js';
import { filterByFullName } from '../../../../shared/infrastructure/utils/filter-utils.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { OrganizationParticipant } from '../../domain/read-models/OrganizationParticipant.js';

async function findPaginatedFilteredParticipants({ organizationId, page, filters = {}, sort = {} }) {
  const totalParticipants = await _countOrganizationParticipant({ organizationId, withImport: false });

  const organizationLearnerQuery = _organizationLearnerParticipantsQuery({
    organizationId,
    page,
    filters,
    sort,
    withImport: false,
  });
  const { results, pagination } = await fetchPage(organizationLearnerQuery, page);
  const organizationParticipants = results.map((rawParticipant) => new OrganizationParticipant(rawParticipant));
  return { organizationParticipants, meta: { ...pagination, participantCount: totalParticipants } };
}

async function findPaginatedFilteredImportedParticipants({
  organizationId,
  page,
  extraColumns,
  filters = {},
  sort = {},
}) {
  const totalParticipants = await _countOrganizationParticipant({ organizationId, withImport: true });

  const organizationLearnerQuery = _organizationLearnerParticipantsQuery({
    organizationId,
    filters,
    extraColumns,
    sort,
    withImport: true,
  });
  const { results, pagination } = await fetchPage(organizationLearnerQuery, page);
  const organizationParticipants = results.map((rawParticipant) => new OrganizationParticipant(rawParticipant));
  return { organizationParticipants, meta: { ...pagination, participantCount: totalParticipants } };
}

function _organizationLearnerParticipantsQuery({
  organizationId,
  filters,
  extraColumns = [],
  sort,
  withImport = true,
}) {
  const orderByClause = _getOrderClause(sort);

  const withQuery = _buildWithQuery({ organizationId, extraColumns, withImport });

  const query = knex.with('participants', withQuery).select('*').from('participants');

  if (!withImport) {
    query.where('participationCount', '>', 0);
  }

  query.orderBy(orderByClause).modify(_filterBySearch, filters).modify(_filterByCertificability, filters);

  return query;
}

function _getOrderClause(sort) {
  const orderByClause = ['lastName', 'firstName', 'id'];
  if (sort.participationCount) {
    orderByClause.unshift({
      column: 'participationCount',
      order: sort.participationCount === 'desc' ? 'desc' : 'asc',
    });
  }
  if (sort.lastnameSort) {
    orderByClause.unshift({
      column: 'lastName',
      order: sort.lastnameSort === 'desc' ? 'desc' : 'asc',
    });
  }

  if (sort.latestParticipationOrder) {
    orderByClause.unshift({
      column: 'lastParticipationDate',
      order: sort.latestParticipationOrder === 'desc' ? 'desc' : 'asc',
    });
  }

  return orderByClause;
}

function _buildWithQuery({ organizationId, extraColumns, withImport }) {
  const selectElement = _getSelectElement();

  const withQuery = knex.select(selectElement).from('view-active-organization-learners');

  if (!withImport) {
    withQuery.join('users', function () {
      this.on('view-active-organization-learners.userId', 'users.id').andOnVal('users.isAnonymous', false);
    });
  } else {
    extraColumns.forEach((extraColumn) => {
      const columnName = `$."${extraColumn.key}"`;

      withQuery.jsonExtract('view-active-organization-learners.attributes', columnName, extraColumn.name);
    });
  }

  withQuery.where({ 'view-active-organization-learners.organizationId': organizationId, isDisabled: false });

  return withQuery;
}

async function _countOrganizationParticipant({ organizationId, withImport = true }) {
  const countParticipationQuery = knex
    .select(knex.raw('COUNT(DISTINCT "view-active-organization-learners"."id")'))
    .from('view-active-organization-learners');

  if (!withImport) {
    countParticipationQuery
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
      });
  }

  countParticipationQuery.where({ organizationId: organizationId, isDisabled: false }).first();

  const { count } = await countParticipationQuery;

  return count ?? 0;
}

function _filterBySearch(queryBuilder, filters) {
  if (filters.fullName) {
    filterByFullName(queryBuilder, filters.fullName, 'firstName', 'lastName');
  }
}

function _filterByCertificability(queryBuilder, filters) {
  if (filters.certificability) {
    queryBuilder.where(function (query) {
      query.whereInArray(
        knex.raw(
          'case when "certifiableAtFromCampaign" > "certifiableAtFromLearner" OR "certifiableAtFromLearner" IS NULL then "isCertifiableFromCampaign" else "isCertifiableFromLearner" end',
        ),
        filters.certificability,
      );
      if (filters.certificability.includes(null)) {
        query.orWhere(function (query) {
          query.whereNull('certifiableAtFromCampaign').whereNull('certifiableAtFromLearner');
        });
      }
    });
  }
}

function _getSelectElement() {
  return [
    'view-active-organization-learners.id',
    'view-active-organization-learners.lastName',
    'view-active-organization-learners.firstName',
    'view-active-organization-learners.isCertifiable as isCertifiableFromLearner',
    'view-active-organization-learners.certifiableAt as certifiableAtFromLearner',

    knex('campaign-participations')
      .join('campaigns', 'campaigns.id', 'campaignId')
      .select('isCertifiable')
      .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
      .and.where('status', CampaignParticipationStatuses.SHARED)
      .and.where('type', CampaignTypes.PROFILES_COLLECTION)
      .and.whereNull('campaign-participations.deletedAt')
      .orderBy('sharedAt', 'desc')
      .limit(1)
      .as('isCertifiableFromCampaign'),

    knex('campaign-participations')
      .join('campaigns', 'campaigns.id', 'campaignId')
      .select('sharedAt')
      .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
      .and.where('status', CampaignParticipationStatuses.SHARED)
      .and.where('type', CampaignTypes.PROFILES_COLLECTION)
      .and.whereNull('campaign-participations.deletedAt')
      .orderBy('sharedAt', 'desc')
      .limit(1)
      .as('certifiableAtFromCampaign'),

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

    knex('campaign-participations')
      .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
      .and.whereNull('campaign-participations.deletedAt')
      .and.where('isImproved', false)
      .count('id')
      .as('participationCount'),
  ];
}

export { findPaginatedFilteredImportedParticipants, findPaginatedFilteredParticipants };
