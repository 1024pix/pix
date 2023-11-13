import { NoCertificationAttestationForDivisionError } from '../../../../shared/domain/errors.js';

const findCertificationAttestationsForDivision = async function ({ organizationId, division, certificateRepository }) {
  const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
    organizationId,
    division,
  });

  if (certificationAttestations.length === 0) {
    throw new NoCertificationAttestationForDivisionError(division);
  }
  return certificationAttestations;
};

export { findCertificationAttestationsForDivision };
