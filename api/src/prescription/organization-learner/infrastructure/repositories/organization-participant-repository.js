import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../src/prescription/shared/domain/constants.ts';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { filterByFullName } from '../../../../shared/infrastructure/utils/filter-utils.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { IMPORT_KEY_FIELD } from '../../../learner-management/domain/constants.js';
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
  const { results, pagination } = await fetchPage({ queryBuilder: organizationLearnerQuery, paginationParams: page });
  const organizationParticipants = results.map((rawParticipant) => new OrganizationParticipant(rawParticipant));
  return { organizationParticipants, meta: { ...pagination, participantCount: totalParticipants } };
}

async function findPaginatedFilteredImportedParticipants({
  organizationId,
  page,
  extraColumns,
  extraFilters,
  filters = {},
  sort = {},
}) {
  const totalParticipants = await _countOrganizationParticipant({ organizationId, withImport: true });

  const organizationLearnerQuery = _organizationLearnerParticipantsQuery({
    organizationId,
    filters,
    extraColumns,
    extraFilters,
    sort,
    withImport: true,
  });
  const { results, pagination } = await fetchPage({ queryBuilder: organizationLearnerQuery, paginationParams: page });
  const organizationParticipants = results.map((rawParticipant) => new OrganizationParticipant(rawParticipant));
  return { organizationParticipants, meta: { ...pagination, participantCount: totalParticipants } };
}

function _organizationLearnerParticipantsQuery({
  organizationId,
  filters,
  extraColumns = [],
  extraFilters = {},
  sort,
  withImport = true,
}) {
  const knexConn = DomainTransaction.getConnection();

  const orderByClause = _getOrderClause(sort, extraColumns);

  const withQuery = _buildWithQuery({ organizationId, extraColumns, withImport, knexConn });

  const query = knexConn.with('participants', withQuery).select('*').from('participants');

  if (!withImport) {
    query.where('participationCount', '>', 0);
  }

  query
    .orderBy(orderByClause)
    .modify(_filterBySearch, filters)
    .modify(_filterByCertificability, filters, knexConn)
    .modify(_filterByAttributes, extraFilters);

  return query;
}

function _getOrderClause(sort, extraColumns = []) {
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

  if (sort.divisionSort) {
    const divisionColumn = extraColumns.find(({ name }) => name === IMPORT_KEY_FIELD.COMMON_DIVISION);
    if (divisionColumn) {
      orderByClause.unshift({
        column: divisionColumn.name,
        order: sort.divisionSort === 'desc' ? 'desc' : 'asc',
      });
    }
  }

  return orderByClause;
}

function _buildWithQuery({ organizationId, extraColumns, withImport, knexConn }) {
  const selectElement = _getSelectElement(extraColumns, knexConn);

  const withQuery = knexConn.select(selectElement).from('view-active-organization-learners');

  if (!withImport) {
    withQuery.leftJoin('users', function () {
      this.on('view-active-organization-learners.userId', 'users.id');
    });
    withQuery.where(function () {
      this.where('users.isAnonymous', false).orWhereNull('users.isAnonymous');
    });
  }

  withQuery.where({ 'view-active-organization-learners.organizationId': organizationId, isDisabled: false });

  return withQuery;
}

async function _countOrganizationParticipant({ organizationId, withImport = true }) {
  const knexConn = DomainTransaction.getConnection();

  const countParticipationQuery = knexConn
    .select(knexConn.raw('COUNT(DISTINCT "view-active-organization-learners"."id")'))
    .from('view-active-organization-learners');

  if (!withImport) {
    countParticipationQuery
      .leftJoin('users', function () {
        this.on('users.id', 'view-active-organization-learners.userId');
      })
      .join('campaign-participations', function () {
        this.on('campaign-participations.organizationLearnerId', 'view-active-organization-learners.id').andOnVal(
          'campaign-participations.deletedAt',
          knexConn.raw('IS'),
          knexConn.raw('NULL'),
        );
      });
    countParticipationQuery.where(function () {
      this.where('users.isAnonymous', false).orWhereNull('users.isAnonymous');
    });
  }

  countParticipationQuery.where({ organizationId: organizationId, isDisabled: false }).first();

  const { count } = await countParticipationQuery;

  return count ?? 0;
}

function _filterByAttributes(queryBuilder, filters = {}) {
  const keys = Object.keys(filters);

  if (!keys.length) return;

  keys.forEach((key) => {
    const searchValue = filters[key];

    if (Array.isArray(searchValue)) {
      queryBuilder.whereIn(key, filters[key]);
    } else {
      queryBuilder.whereRaw(`?? LIKE ?`, [key, '%' + filters[key] + '%']);
    }
  });
}

function _filterBySearch(queryBuilder, filters) {
  if (filters.fullName) {
    filterByFullName(queryBuilder, filters.fullName, 'firstName', 'lastName');
  }
}

function _filterByCertificability(queryBuilder, filters, knexConn) {
  if (filters.certificability) {
    queryBuilder.where(function (query) {
      query.whereInArray(
        knexConn.raw(
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

function _getSelectElement(extraColumns, knexConn) {
  const extraSubQueries = extraColumns.map(({ key, name }) => {
    return knexConn('organization-learners')
      .select(knexConn.raw(`"organization-learners"."attributes" ->> ?`, key))
      .whereRaw('"id" = "view-active-organization-learners"."id"')
      .as(name);
  });

  return [
    'view-active-organization-learners.id',
    'view-active-organization-learners.lastName',
    'view-active-organization-learners.firstName',
    'view-active-organization-learners.isCertifiable as isCertifiableFromLearner',
    'view-active-organization-learners.certifiableAt as certifiableAtFromLearner',

    knexConn('campaign-participations')
      .join('campaigns', 'campaigns.id', 'campaignId')
      .select('isCertifiable')
      .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
      .and.where('status', CampaignParticipationStatuses.SHARED)
      .and.where('type', CampaignTypes.PROFILES_COLLECTION)
      .and.whereNull('campaign-participations.deletedAt')
      .orderBy('sharedAt', 'desc')
      .limit(1)
      .as('isCertifiableFromCampaign'),

    knexConn('campaign-participations')
      .join('campaigns', 'campaigns.id', 'campaignId')
      .select('sharedAt')
      .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
      .and.where('status', CampaignParticipationStatuses.SHARED)
      .and.where('type', CampaignTypes.PROFILES_COLLECTION)
      .and.whereNull('campaign-participations.deletedAt')
      .orderBy('sharedAt', 'desc')
      .limit(1)
      .as('certifiableAtFromCampaign'),

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

    knexConn('campaign-participations')
      .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
      .and.whereNull('campaign-participations.deletedAt')
      .and.where('isImproved', false)
      .count('id')
      .as('participationCount'),
    ...extraSubQueries,
  ];
}

export { findPaginatedFilteredImportedParticipants, findPaginatedFilteredParticipants };
