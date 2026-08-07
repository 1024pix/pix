import { NoCertificateForDivisionError } from '../../../../shared/domain/errors.js';

export async function findCertificationAttestationsForDivision({ organizationId, division, certificateRepository }) {
  const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
    organizationId,
    division,
  });

  if (certificationAttestations.length === 0) {
    throw new NoCertificateForDivisionError(division);
  }
  return certificationAttestations;
}
