import { usecases } from '../domain/usecases/index.js';
import * as certificationEligibilitySerializer from '../infrastructure/serializers/certification-eligibility-serializer.js';

const isCertifiable = async function (request, h, dependencies = { certificationEligibilitySerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const certificationEligibility = await usecases.getUserCertificationEligibility({
    userId: authenticatedUserId,
  });
  return dependencies.certificationEligibilitySerializer.serialize(certificationEligibility);
};

const userController = {
  isCertifiable,
};

export { userController };
