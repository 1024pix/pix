const { knex } = require('../../../../db/knex-database-connection');
const { NotFoundError } = require('../../../domain/errors');
const OrganizationLearner = require('../../../domain/read-models/organization-learner-follow-up/OrganizationLearner');

async function get(organizationLearnerId) {
  const row = await knex('organization-learners')
    .select(
      'organization-learners.id',
      'organization-learners.firstName',
      'organization-learners.lastName',
      'division',
      'group',
      knex.raw('array_remove(ARRAY_AGG("identityProvider"), NULL) AS "authenticationMethods"'),
      'users.email',
      'users.username'
    )
    .where('organization-learners.id', organizationLearnerId)
    .leftJoin('authentication-methods', 'authentication-methods.userId', 'organization-learners.userId')
    .leftJoin('users', 'organization-learners.userId', 'users.id')
    .groupBy('organization-learners.id', 'users.id')
    .first();

  if (row) {
    return new OrganizationLearner(row);
  }
  throw new NotFoundError(`Student not found for ID ${organizationLearnerId}`);
}

module.exports = { get };
