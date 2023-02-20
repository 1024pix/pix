import { NoCertificationAttestationForDivisionError } from '../../errors';

export default async function findCertificationAttestationsForDivision({
  organizationId,
  division,
  certificateRepository,
}) {
  const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
    organizationId,
    division,
  });

  if (certificationAttestations.length === 0) {
    throw new NoCertificationAttestationForDivisionError(division);
  }
  return certificationAttestations;
}
