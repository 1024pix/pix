import { usecases } from '../domain/usecases/index.js';
import * as organizationLearnerSerializer from '../infrastructure/serializers/organization-learner.js';

const getById = async function (request) {
  const organizationLearnerId = request.params.id;
  const organizationLearner = await usecases.getOrganizationLearnerWithMissionIdsByState({ organizationLearnerId });
  return organizationLearnerSerializer.serialize(organizationLearner);
};

const organizationLearnerController = { getById };
export { organizationLearnerController };
