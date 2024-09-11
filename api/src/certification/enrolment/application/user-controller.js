import { config } from '../../../shared/config.js';
import { usecases } from '../domain/usecases/index.js';
import * as certificationEligibilitySerializer from '../infrastructure/serializers/certification-eligibility-serializer.js';

const isCertifiable = async function (request, h, dependencies = { certificationEligibilitySerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;
  let certificationEligibility;
  if (config.featureToggles.isV3EligibilityCheckEnabled) {
    certificationEligibility = await usecases.getUserCertificationEligibility();
    return true;
  } else {
    certificationEligibility = await usecases.getV2UserCertificationEligibility({
      userId: authenticatedUserId,
    });
  }
  return dependencies.certificationEligibilitySerializer.serialize(certificationEligibility);
};

const userController = {
  isCertifiable,
};

export { userController };
