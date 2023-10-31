import { usecases } from '../../shared/usecases/index.js';
import * as organizationLearnerSerializer from '../../infrastructure/serializers/organization-learner.js';

const getById = async function (request) {
  const organizationLearnerId = request.params.id;
  const organizationLearner = await usecases.getOrganizationLearnerWithCompletedMissionIds({ organizationLearnerId });
  return organizationLearnerSerializer.serialize(organizationLearner);
};

const organizationLearnerController = { getById };
export { organizationLearnerController };
