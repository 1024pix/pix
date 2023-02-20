import CertificationEligibility from '../../../../lib/domain/read-models/CertificationEligibility';

export default function buildCertificationEligibility({
  id = 123,
  pixCertificationEligible = false,
  eligibleComplementaryCertifications = [],
} = {}) {
  return new CertificationEligibility({
    id,
    pixCertificationEligible,
    eligibleComplementaryCertifications,
  });
}
