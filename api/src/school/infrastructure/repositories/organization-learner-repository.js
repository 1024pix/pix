import _ from 'lodash';

import { knex } from '../../../../db/knex-database-connection.js';
import { OrganizationLearner } from '../../domain/models/OrganizationLearner.js';

import * as injectedOrganizationLearnerApi from '../../../prescription/organization-learner/application/api/organization-learners-api.js';

const getStudentsByOrganizationId = async function(
  { organizationId, organizationLearnerApi = injectedOrganizationLearnerApi } = {},
) {
  const { organizationLearners } = await organizationLearnerApi.find({
    organizationId,
  });

  return organizationLearners.map((organizationLearner) => new OrganizationLearner(organizationLearner));
};

const getById = async function(
  { organizationLearnerId, organizationLearnerApi = injectedOrganizationLearnerApi } = {},
) {
  const learner = await organizationLearnerApi.get(organizationLearnerId);

  return new OrganizationLearner(learner);
};

async function getDivisionsWhichStartedMission(
  { missionId, organizationId, organizationLearnerApi = injectedOrganizationLearnerApi } = {},
) {
  const { organizationLearners } = await organizationLearnerApi.find({
    organizationId,
  });

  const startedOrganizationLearnersIds = await knex
    .select('organizationLearnerId')
    .from('mission-assessments')
    .where({ missionId })
    .whereIn(
      'organizationLearnerId',
      organizationLearners.map(({ id }) => id),
    )
    .pluck('organizationLearnerId');

  return _.uniq(
    organizationLearners
      .filter((organizationLearner) => startedOrganizationLearnersIds.includes(organizationLearner.id))
      .map((startedOrganizationLearner) => startedOrganizationLearner.division),
  ).join(', ');
}

export { getById, getDivisionsWhichStartedMission, getStudentsByOrganizationId };
