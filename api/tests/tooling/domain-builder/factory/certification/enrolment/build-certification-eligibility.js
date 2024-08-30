import { CertificationEligibility } from '../../../../../../src/certification/enrolment/domain/read-models/CertificationEligibility.js';

const buildCertificationEligibilityEnrolment = function ({
  id = 123,
  pixCertificationEligible = false,
  complementaryCertifications = [],
} = {}) {
  return new CertificationEligibility({
    id,
    pixCertificationEligible,
    complementaryCertifications,
  });
};

export { buildCertificationEligibilityEnrolment };
