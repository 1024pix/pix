import { usecases } from '../../domain/usecases/index.js';

const dissociate = async function (request, h) {
  const organizationLearnerId = request.params.id;
  await usecases.dissociateUserFromOrganizationLearner({ organizationLearnerId });
  return h.response().code(204);
};

const organizationLearnerController = { dissociate };

export { organizationLearnerController };
