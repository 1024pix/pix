import _ from 'lodash';

import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../src/prescription/shared/domain/constants.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../identity-access-management/domain/constants/identity-providers.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { filterByFullName } from '../../../../shared/infrastructure/utils/filter-utils.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { ScoOrganizationParticipant } from '../../domain/read-models/ScoOrganizationParticipant.js';

function _setFilters(qb, { search, divisions, connectionTypes, certificability } = {}, knexConn) {
  if (search) {
    filterByFullName(qb, search, 'firstName', 'lastName');
  }
  if (!_.isEmpty(divisions)) {
    qb.whereIn('division', divisions);
  }
  if (!_.isEmpty(connectionTypes)) {
    qb.where(function () {
      if (connectionTypes.includes('none')) {
        this.orWhere(function () {
          this.whereNull('username');
          this.whereNull('email');
          // we only retrieve GAR authentication method in join clause
          this.whereNull('samlId');
        });
      }
      if (connectionTypes.includes('identifiant')) {
        this.orWhereNotNull('username');
      }
      if (connectionTypes.includes('email')) {
        this.orWhereNotNull('email');
      }
      if (connectionTypes.includes('mediacentre')) {
        // we only retrieve GAR authentication method in join clause
        this.orWhereNotNull('samlId');
      }
      if (connectionTypes.includes('without_mediacentre')) {
        this.orWhereNull('samlId');
      }
    });
  }
  if (certificability) {
    qb.where(function (query) {
      query.whereInArray(
        knexConn.raw(
          'case when "certifiableAtFromCampaign" > "certifiableAtFromLearner" OR "certifiableAtFromLearner" IS NULL then "isCertifiableFromCampaign" else "isCertifiableFromLearner" end',
        ),
        certificability,
      );
      if (certificability.includes(null)) {
        query.orWhere(function (query) {
          query.whereNull('certifiableAtFromCampaign').whereNull('certifiableAtFromLearner');
        });
      }
    });
  }
}

const findPaginatedFilteredScoParticipants = async function ({ organizationId, filter, page = {}, sort = {} }) {
  const knexConn = DomainTransaction.getConnection();

  const { totalScoParticipants } = await knexConn
    .count('id', { as: 'totalScoParticipants' })
    .from('view-active-organization-learners')
    .where({ organizationId: organizationId, isDisabled: false })
    .first();

  const orderByClause = ['lastName', 'firstName', 'division', 'id'];
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

  if (sort?.divisionSort) {
    orderByClause.unshift({
      column: 'division',
      order: sort.divisionSort == 'desc' ? 'desc' : 'asc',
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
          'users.username',
          'users.email',
          'user-logins.temporaryBlockedUntil',
          'user-logins.blockedAt',
          'authentication-methods.externalIdentifier as samlId',
          'view-active-organization-learners.division',
          'view-active-organization-learners.group',
          'view-active-organization-learners.userId',
          'view-active-organization-learners.studentNumber',
          'view-active-organization-learners.organizationId',
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
            .select('campaign-participations.createdAt')
            .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
            .and.whereNull('campaign-participations.deletedAt')
            .and.where('isImproved', false)
            .orderBy('campaign-participations.createdAt', 'desc')
            .limit(1)
            .as('lastParticipationDate'),
          /**
           * We use knex.raw here since there is no easy way to wrap
           * the query into a coalesce with knex)
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
        .leftJoin('user-logins', function () {
          this.on('user-logins.userId', 'users.id');
        })
        .leftJoin('authentication-methods', function () {
          this.on('users.id', 'authentication-methods.userId').andOnVal(
            'authentication-methods.identityProvider',
            NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          );
        })
        .where('view-active-organization-learners.organizationId', organizationId)
        .and.where('view-active-organization-learners.isDisabled', false),
    )
    .select('*')
    .from('participants')
    .modify(_setFilters, filter, knexConn)
    .orderBy(orderByClause);

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });

  const scoOrganizationParticipants = results.map((result) => {
    const now = new Date();
    return new ScoOrganizationParticipant({
      ...result,
      isTemporarilyBlocked: result.temporaryBlockedUntil > now,
      isBlocked: Boolean(result.blockedAt),
      isAuthenticatedFromGAR: !!result.samlId,
    });
  });
  return {
    data: scoOrganizationParticipants,
    meta: { ...pagination, participantCount: totalScoParticipants },
  };
};

export { findPaginatedFilteredScoParticipants };
