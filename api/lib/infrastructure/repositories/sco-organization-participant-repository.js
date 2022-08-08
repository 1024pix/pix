const _ = require('lodash');

const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');
const { knex } = require('../../../db/knex-database-connection');
const { fetchPage } = require('../utils/knex-utils');
const ScoOrganizationParticipant = require('../../domain/read-models/ScoOrganizationParticipant');

function _setFilters(qb, { lastName, firstName, divisions, connexionType } = {}) {
  if (lastName) {
    qb.whereRaw('LOWER("organization-learners"."lastName") LIKE ?', `%${lastName.toLowerCase()}%`);
  }
  if (firstName) {
    qb.whereRaw('LOWER("organization-learners"."firstName") LIKE ?', `%${firstName.toLowerCase()}%`);
  }
  if (!_.isEmpty(divisions)) {
    qb.whereIn('division', divisions);
  }
  if (connexionType === 'none') {
    qb.whereRaw('"users"."username" IS NULL');
    qb.whereRaw('"users"."email" IS NULL');
    // we only retrieve GAR authentication method in join clause
    qb.whereRaw('"authentication-methods"."externalIdentifier" IS NULL');
  } else if (connexionType === 'identifiant') {
    qb.whereRaw('"users"."username" IS NOT NULL');
  } else if (connexionType === 'email') {
    qb.whereRaw('"users"."email" IS NOT NULL');
  } else if (connexionType === 'mediacentre') {
    // we only retrieve GAR authentication method in join clause
    qb.whereRaw('"authentication-methods"."externalIdentifier" IS NOT NULL');
  }
}

module.exports = {
  async findPaginatedFilteredScoParticipants({ organizationId, filter, page = {} }) {
    const query = knex
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
        knex.raw(
          'FIRST_VALUE("name") OVER(PARTITION BY "organizationLearnerId" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignName"'
        ),
        knex.raw(
          'FIRST_VALUE("campaign-participations"."status") OVER(PARTITION BY "organizationLearnerId" ORDER BY "campaign-participations"."createdAt" DESC) AS "participationStatus"'
        ),
        knex.raw(
          'FIRST_VALUE("type") OVER(PARTITION BY "organizationLearnerId" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignType"'
        ),
        knex.raw(
          'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER(PARTITION BY "organizationLearnerId") AS "participationCount"'
        ),
        knex.raw(
          'max("campaign-participations"."createdAt") OVER(PARTITION BY "organizationLearnerId") AS "lastParticipationDate"'
        ),
      ])
      .from('organization-learners')
      .leftJoin('campaign-participations', 'campaign-participations.organizationLearnerId', 'organization-learners.id')
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
      .where(function (qb) {
        qb.where({ 'campaign-participations.id': null });
        qb.orWhere({
          'campaign-participations.isImproved': false,
          'campaign-participations.deletedAt': null,
        });
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
      pagination,
    };
  },
};
