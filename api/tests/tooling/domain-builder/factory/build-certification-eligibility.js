import { CertificationEligibility } from '../../../../lib/shared/domain/read-models/CertificationEligibility.js';

const buildCertificationEligibility = function ({
  id = 123,
  pixCertificationEligible = false,
  eligibleComplementaryCertifications = [],
} = {}) {
  return new CertificationEligibility({
    id,
    pixCertificationEligible,
    eligibleComplementaryCertifications,
  });
};

export { buildCertificationEligibility };
