import _ from 'lodash';
import { filterByFullName } from '../../../../../lib/infrastructure/utils/filter-utils.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../lib/domain/constants/identity-providers.js';
import { knex } from '../../../../../db/knex-database-connection.js';
import { fetchPage } from '../../../../../lib/infrastructure/utils/knex-utils.js';
import { ScoOrganizationParticipant } from '../../domain/read-models/ScoOrganizationParticipant.js';
import { CampaignTypes } from '../../../../../src/prescription/campaign/domain/read-models/CampaignTypes.js';
import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';

function _setFilters(qb, { search, divisions, connectionTypes, certificability } = {}) {
  if (search) {
    filterByFullName(
      qb,
      search,
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
    );
  }
  if (!_.isEmpty(divisions)) {
    qb.whereIn('division', divisions);
  }
  if (!_.isEmpty(connectionTypes)) {
    qb.where(function () {
      if (connectionTypes.includes('none')) {
        this.orWhere(function () {
          this.whereRaw('"users"."username" IS NULL');
          this.whereRaw('"users"."email" IS NULL');
          // we only retrieve GAR authentication method in join clause
          this.whereRaw('"authentication-methods"."externalIdentifier" IS NULL');
        });
      }
      if (connectionTypes.includes('identifiant')) {
        this.orWhereRaw('"users"."username" IS NOT NULL');
      }
      if (connectionTypes.includes('email')) {
        this.orWhereRaw('"users"."email" IS NOT NULL');
      }
      if (connectionTypes.includes('mediacentre')) {
        // we only retrieve GAR authentication method in join clause
        this.orWhereRaw('"authentication-methods"."externalIdentifier" IS NOT NULL');
      }
      if (connectionTypes.includes('without_mediacentre')) {
        this.orWhereRaw('"authentication-methods"."externalIdentifier" IS NULL');
      }
    });
  }
  if (certificability) {
    qb.where(function (query) {
      query.whereInArray(
        knex.raw(
          'case when "certifiableAtFromCampaign" > "view-active-organization-learners"."certifiableAt" OR "view-active-organization-learners"."certifiableAt" IS NULL then "isCertifiableFromCampaign" else "view-active-organization-learners"."isCertifiable" end',
        ),
        certificability,
      );
      if (certificability.includes(null)) {
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
    .join('campaign-participations', function () {
      this.on('view-active-organization-learners.id', 'campaign-participations.organizationLearnerId')
        .andOn('view-active-organization-learners.userId', 'campaign-participations.userId')
        .andOnVal('campaign-participations.status', CampaignParticipationStatuses.SHARED)
        .andOn('campaign-participations.deletedAt', knex.raw('IS'), knex.raw('NULL'));
    })
    .join('campaigns', function () {
      this.on('campaigns.id', 'campaign-participations.campaignId')
        .andOnVal('campaigns.type', CampaignTypes.PROFILES_COLLECTION)
        .andOnVal('campaigns.organizationId', organizationId);
    })
    .where('view-active-organization-learners.organizationId', organizationId);
}

const findPaginatedFilteredScoParticipants = async function ({ organizationId, filter, page = {}, sort = {} }) {
  const { totalScoParticipants } = await knex
    .count('id', { as: 'totalScoParticipants' })
    .from('view-active-organization-learners')
    .where({ organizationId: organizationId, isDisabled: false })
    .first();

  const orderByClause = [
    'view-active-organization-learners.lastName',
    'view-active-organization-learners.firstName',
    'view-active-organization-learners.division',
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

  if (sort?.divisionSort) {
    orderByClause.unshift({
      column: 'view-active-organization-learners.division',
      order: sort.divisionSort == 'desc' ? 'desc' : 'asc',
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
      'view-active-organization-learners.division',
      'view-active-organization-learners.userId',
      'view-active-organization-learners.organizationId',
      'users.username',
      'users.email',
      'authentication-methods.externalIdentifier as samlId',
      'subquery.isCertifiableFromCampaign',
      'subquery.certifiableAtFromCampaign',
      'view-active-organization-learners.isCertifiable as isCertifiableFromLearner',
      'view-active-organization-learners.certifiableAt as certifiableAtFromLearner',
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
    .leftJoin('users', 'users.id', 'view-active-organization-learners.userId')
    .leftJoin('campaign-participations', function () {
      this.on('campaign-participations.organizationLearnerId', 'view-active-organization-learners.id')
        .andOn('campaign-participations.userId', 'view-active-organization-learners.userId')
        .andOnVal('campaign-participations.isImproved', false)
        .andOnVal('campaign-participations.deletedAt', knex.raw('IS'), knex.raw('NULL'));
    })
    .leftJoin('authentication-methods', function () {
      this.on('users.id', 'authentication-methods.userId').andOnVal(
        'authentication-methods.identityProvider',
        NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
      );
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

  const scoOrganizationParticipants = results.map((result) => {
    return new ScoOrganizationParticipant({
      ...result,
      isAuthenticatedFromGAR: !!result.samlId,
    });
  });
  return {
    data: scoOrganizationParticipants,
    meta: { ...pagination, participantCount: totalScoParticipants },
  };
};

export { findPaginatedFilteredScoParticipants };
