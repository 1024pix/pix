import { DoubleCertificationEligibility } from '../../../../../../src/certification/enrolment/domain/read-models/UserCertificationEligibility.js';

const buildDoubleCertificationEligibility = function ({
  label = "Label d'éligibilité",
  imageUrl = "url d'image",
  isEligible = true,
  certificationAlreadySucceeded = false,
} = {}) {
  return new DoubleCertificationEligibility({
    label,
    imageUrl,
    isEligible,
    certificationAlreadySucceeded,
  });
};

export { buildDoubleCertificationEligibility };
