import { CertificationEligibility } from '../../../../../../src/certification/enrolment/domain/read-models/UserCertificationEligibility.js';

const buildV3CertificationEligibility = function ({
  label = "Label d'éligibilité",
  imageUrl = "url d'image",
  isOutdated = false,
  isAcquiredExpectedLevel = true,
} = {}) {
  return new CertificationEligibility({
    label,
    imageUrl,
    isOutdated,
    isAcquiredExpectedLevel,
  });
};

export { buildV3CertificationEligibility };
