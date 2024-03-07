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

async function getDivisionsWhichStartedMission(missionId, organizationId) {
  const rawDivisions = await knex
    .distinct('division')
    .from('organization-learners')
    .join('mission-assessments', 'mission-assessments.organizationLearnerId', 'organization-learners.id')
    .where({ organizationId, missionId })
    .andWhere('isDisabled', false);

  return rawDivisions.map((rawDivision) => rawDivision.division).join(', ');
}

export { getStudentsByOrganizationId, getById, getDivisionsWhichStartedMission };
