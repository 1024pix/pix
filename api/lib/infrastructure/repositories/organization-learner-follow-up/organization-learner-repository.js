const { knex } = require('../../../../db/knex-database-connection.js');
const { NotFoundError } = require('../../../domain/errors.js');
const OrganizationLearner = require('../../../domain/read-models/organization-learner-follow-up/OrganizationLearner.js');
const CampaignTypes = require('../../../domain/models/CampaignTypes.js');
const CampaignParticipationStatuses = require('../../../domain/models/CampaignParticipationStatuses.js');

function _buildIsCertifiable(queryBuilder, organizationLearnerId) {
  queryBuilder
    .distinct('organization-learners.id')
    .select(
      'organization-learners.id as organizationLearnerId',
      knex.raw(
        'FIRST_VALUE("isCertifiable") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "isCertifiable"'
      ),
      knex.raw(
        'FIRST_VALUE("sharedAt") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "certifiableAt"'
      )
    )
    .from('organization-learners')
    .join('campaign-participations', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.status', CampaignParticipationStatuses.SHARED)
    .where('campaigns.type', CampaignTypes.PROFILES_COLLECTION)
    .where('organization-learners.id', organizationLearnerId)
    .where('campaign-participations.deletedAt', null);
}

async function get(organizationLearnerId) {
  const row = await knex
    .with('subquery', (qb) => _buildIsCertifiable(qb, organizationLearnerId))
    .select(
      'organization-learners.id',
      'organization-learners.firstName',
      'organization-learners.lastName',
      'division',
      'group',
      'subquery.isCertifiable',
      'subquery.certifiableAt',
      knex.raw('array_remove(ARRAY_AGG("identityProvider"), NULL) AS "authenticationMethods"'),
      'users.email',
      'users.username'
    )
    .from('organization-learners')
    .where('organization-learners.id', organizationLearnerId)
    .leftJoin('subquery', 'subquery.organizationLearnerId', 'organization-learners.id')
    .leftJoin('authentication-methods', 'authentication-methods.userId', 'organization-learners.userId')
    .leftJoin('users', 'organization-learners.userId', 'users.id')
    .groupBy('organization-learners.id', 'users.id', 'subquery.isCertifiable', 'subquery.certifiableAt')
    .first();
  if (row) {
    return new OrganizationLearner(row);
  }
  throw new NotFoundError(`Student not found for ID ${organizationLearnerId}`);
}

module.exports = { get };
