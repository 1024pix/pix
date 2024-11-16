import { usecases } from '../domain/usecases/index.js';

const create = async function (request, h) {
  const organizationLearnerId = request.params.organizationLearnerId;
  const featureKey = request.params.featureKey;

  const organizationLearnerFeature = await usecases.createOrganizationLearnerFeature({
    organizationLearnerId,
    featureKey,
  });

  return h.response(organizationLearnerFeature).code(201);
};

const unlink = async function (request, h) {
  const organizationLearnerId = request.params.organizationLearnerId;
  const featureKey = request.params.featureKey;

  const organizationLearnerFeature = await usecases.unlinkOrganizationLearnerFeature({
    organizationLearnerId,
    featureKey,
  });

  return h.response(organizationLearnerFeature);
};

const organizationLearnerFeaturesController = {
  create,
  unlink,
};

export { organizationLearnerFeaturesController };
