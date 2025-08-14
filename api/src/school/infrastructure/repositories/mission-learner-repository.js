import { SchoolLearner } from '../../domain/models/SchoolLearner.js';

import * as injectedOrganizationLearnerApi from '../../../prescription/organization-learner/application/api/organization-learners-api.js';

const findMissionLearners = async function(
  { organizationId, filter, organizationLearnerApi = injectedOrganizationLearnerApi } = {},
) {
  const { organizationLearners } = await organizationLearnerApi.find({ organizationId, filter });

  const missionLearners = organizationLearners.map((missionLearner) => new SchoolLearner({ ...missionLearner }));
  return { missionLearners };
};

export { findMissionLearners };
