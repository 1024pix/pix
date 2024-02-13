import { knex } from '../../../../db/knex-database-connection.js';
import { OrganizationLearner } from '../../domain/models/OrganizationLearner.js';

const getStudentsByOrganizationId = function (organizationId) {
  return knex('view-active-organization-learners')
    .where({ organizationId: organizationId })
    .orderByRaw('LOWER("firstName") ASC, LOWER("lastName") ASC')
    .then((organizationLearners) =>
      organizationLearners.map((organizationLearner) => new OrganizationLearner(organizationLearner)),
    );
};

const getById = async function (organizationLearnerId) {
  const result = await knex('organization-learners').where({ id: organizationLearnerId }).first();

  return new OrganizationLearner({
    ...result,
  });
};

export { getStudentsByOrganizationId, getById };
