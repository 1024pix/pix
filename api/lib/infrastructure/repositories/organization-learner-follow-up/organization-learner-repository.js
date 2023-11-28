import { knex } from '../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../domain/errors.js';
import { OrganizationLearner } from '../../../domain/read-models/organization-learner-follow-up/OrganizationLearner.js';
import { CampaignTypes } from '../../../../src/prescription/campaign/domain/read-models/CampaignTypes.js';
import { CampaignParticipationStatuses } from '../../../domain/models/CampaignParticipationStatuses.js';

function _buildIsCertifiable(queryBuilder, organizationLearnerId) {
  queryBuilder
    .distinct('view-active-organization-learners.id')
    .select(
      'view-active-organization-learners.id as organizationLearnerId',
      knex.raw(
        'FIRST_VALUE("campaign-participations"."isCertifiable") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "isCertifiable"',
      ),
      knex.raw(
        'FIRST_VALUE("campaign-participations"."sharedAt") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "certifiableAt"',
      ),
    )
    .from('view-active-organization-learners')
    .join(
      'campaign-participations',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.status', CampaignParticipationStatuses.SHARED)
    .where('campaigns.type', CampaignTypes.PROFILES_COLLECTION)
    .where('view-active-organization-learners.id', organizationLearnerId)
    .where('campaign-participations.deletedAt', null);
}

async function get(organizationLearnerId) {
  const row = await knex
    .with('subquery', (qb) => _buildIsCertifiable(qb, organizationLearnerId))
    .select(
      'view-active-organization-learners.id',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
      'view-active-organization-learners.division',
      'view-active-organization-learners.group',
      'subquery.isCertifiable',
      'subquery.certifiableAt',
      knex.raw('array_remove(ARRAY_AGG("identityProvider"), NULL) AS "authenticationMethods"'),
      'users.email',
      'users.username',
    )
    .from('view-active-organization-learners')
    .where('view-active-organization-learners.id', organizationLearnerId)
    .leftJoin('subquery', 'subquery.organizationLearnerId', 'view-active-organization-learners.id')
    .leftJoin('authentication-methods', 'authentication-methods.userId', 'view-active-organization-learners.userId')
    .leftJoin('users', 'view-active-organization-learners.userId', 'users.id')
    .groupBy(
      'view-active-organization-learners.id',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
      'view-active-organization-learners.division',
      'view-active-organization-learners.group',
      'users.id',
      'subquery.isCertifiable',
      'subquery.certifiableAt',
    )
    .first();
  if (row) {
    return new OrganizationLearner(row);
  }
  throw new NotFoundError(`Student not found for ID ${organizationLearnerId}`);
}

export { get };
