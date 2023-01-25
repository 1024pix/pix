const _ = require('lodash');
const { filterByFullName } = require('../utils/filter-utils');

const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');
const { knex } = require('../../../db/knex-database-connection');
const { fetchPage } = require('../utils/knex-utils');
const ScoOrganizationParticipant = require('../../domain/read-models/ScoOrganizationParticipant');
const CampaignTypes = require('../../domain/models/CampaignTypes');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses');

function _setFilters(qb, { search, divisions, connectionTypes, certificability } = {}) {
  if (search) {
    filterByFullName(qb, search, 'organization-learners.firstName', 'organization-learners.lastName');
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
    });
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
  async findPaginatedFilteredScoParticipants({ organizationId, filter, page = {} }) {
    const { totalScoParticipants } = await knex
      .count('id', { as: 'totalScoParticipants' })
      .from('organization-learners')
      .where({ organizationId: organizationId, isDisabled: false })
      .first();

    const query = knex
      .with('subquery', (qb) => _buildIsCertifiable(qb, organizationId))
      .distinct('organization-learners.id')
      .select([
        'organization-learners.id',
        'organization-learners.firstName',
        'organization-learners.lastName',
        knex.raw('LOWER("organization-learners"."firstName") AS "lowerFirstName"'),
        knex.raw('LOWER("organization-learners"."lastName") AS "lowerLastName"'),
        'organization-learners.birthdate',
        'organization-learners.division',
        'organization-learners.userId',
        'organization-learners.organizationId',
        'users.username',
        'users.email',
        'authentication-methods.externalIdentifier as samlId',
        'subquery.isCertifiable',
        'subquery.certifiableAt',
        knex.raw(
          'FIRST_VALUE("name") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignName"'
        ),
        knex.raw(
          'FIRST_VALUE("campaign-participations"."status") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "participationStatus"'
        ),
        knex.raw(
          'FIRST_VALUE("type") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignType"'
        ),
        knex.raw(
          'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER(PARTITION BY "organization-learners"."id") AS "participationCount"'
        ),
        knex.raw(
          'max("campaign-participations"."createdAt") OVER(PARTITION BY "organization-learners"."id") AS "lastParticipationDate"'
        ),
      ])
      .from('organization-learners')
      .leftJoin('subquery', 'subquery.organizationLearnerId', 'organization-learners.id')
      .leftJoin('campaign-participations', function () {
        this.on('campaign-participations.organizationLearnerId', 'organization-learners.id')
          .andOn('campaign-participations.isImproved', '=', knex.raw('false'))
          .andOn('campaign-participations.deletedAt', knex.raw('is'), knex.raw('null'));
      })
      .leftJoin('users', 'users.id', 'organization-learners.userId')
      .leftJoin('authentication-methods', function () {
        this.on('users.id', 'authentication-methods.userId').andOnVal(
          'authentication-methods.identityProvider',
          AuthenticationMethod.identityProviders.GAR
        );
      })
      .leftJoin('campaigns', function () {
        this.on('campaigns.id', 'campaign-participations.campaignId').andOn(
          'campaigns.organizationId',
          'organization-learners.organizationId'
        );
      })
      .where('organization-learners.isDisabled', false)
      .where('organization-learners.organizationId', organizationId)
      .modify(_setFilters, filter)
      .orderByRaw('?? ASC, ?? ASC', ['lowerLastName', 'lowerFirstName']);

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
  },
};
