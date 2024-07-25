import { CertificationEligibility } from '../../../../src/shared/domain/read-models/CertificationEligibility.js';

const buildCertificationEligibility = function ({
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

export { buildCertificationEligibility };
