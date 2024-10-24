// import { usecases } from '../domain/usecases/index.js';

const createOrganizationLearnerFeatures = async function (request, h) {
  const organizationId = request.query.organizationId;
  const organizationLearnerId = request.query.organizationLearnerId;
  const featureKey = request.query.featureKey;

  const buffer = [] // await usecases.getAttestationZipForDivisions({ attestationKey, organizationId, divisions });

  return h.response(buffer).header('Content-Type', 'application/zip');
};

const organizationLearnerFeaturesController = {
  createOrganizationLearnerFeatures,
};

export { organizationLearnerFeaturesController };
