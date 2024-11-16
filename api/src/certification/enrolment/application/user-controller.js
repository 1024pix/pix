import { usecases } from '../domain/usecases/index.js';
import * as userCertificationEligibilitySerializer from '../infrastructure/serializers/user-certification-eligibility-serializer.js';

const isCertifiable = async function (request) {
  const userId = request.auth.credentials.userId;
  const certificationEligibility = await usecases.getUserCertificationEligibility({
    userId,
  });
  return userCertificationEligibilitySerializer.serialize(certificationEligibility);
};

const userController = {
  isCertifiable,
};

export { userController };
