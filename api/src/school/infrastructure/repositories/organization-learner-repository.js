import { knex } from '../../../../db/knex-database-connection.js';
import { OrganizationLearner } from '../../domain/models/OrganizationLearner.js';

const getStudentsByOrganizationId = async function ({ organizationId, organizationLearnerApi }) {
  const { organizationLearners } = await organizationLearnerApi.find({
    organizationId,
  });

  return organizationLearners.map((organizationLearner) => new OrganizationLearner(organizationLearner));
};

const getById = async function ({ organizationLearnerId, organizationLearnerApi }) {
  const learner = await organizationLearnerApi.get(organizationLearnerId);

  return new OrganizationLearner(learner);
};

async function getDivisionsWhichStartedMission({ missionId, organizationId }) {
  const rawDivisions = await knex
    .distinct('division')
    .from('organization-learners')
    .join('mission-assessments', 'mission-assessments.organizationLearnerId', 'organization-learners.id')
    .where({ organizationId, missionId })
    .andWhere('isDisabled', false);

  return rawDivisions.map((rawDivision) => rawDivision.division).join(', ');
}

export { getById, getDivisionsWhichStartedMission, getStudentsByOrganizationId };
