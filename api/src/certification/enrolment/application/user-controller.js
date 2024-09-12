import { config } from '../../../shared/config.js';
import { usecases } from '../domain/usecases/index.js';
import * as certificationEligibilitySerializer from '../infrastructure/serializers/certification-eligibility-serializer.js';
import * as userCertificationEligibilitySerializer from '../infrastructure/serializers/user-certification-eligibility-serializer.js';

const isCertifiable = async function (request, h, dependencies = { certificationEligibilitySerializer }) {
  const userId = request.auth.credentials.userId;
  let certificationEligibility;
  if (config.featureToggles.isV3EligibilityCheckEnabled) {
    certificationEligibility = await usecases.getUserCertificationEligibility({
      userId,
    });
    return userCertificationEligibilitySerializer.serialize(certificationEligibility);
  } else {
    certificationEligibility = await usecases.getV2UserCertificationEligibility({
      userId,
    });
    return dependencies.certificationEligibilitySerializer.serialize(certificationEligibility);
  }
};

const userController = {
  isCertifiable,
};

export { userController };
