import { NoCertificateForDivisionError } from '../../../../shared/domain/errors.js';
import * as injectedCertificateRepository from '../../infrastructure/repositories/certificate-repository.js';

const findCertificationAttestationsForDivision = async function ({
  organizationId,
  division,
  certificateRepository = injectedCertificateRepository,
} = {}) {
  const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
    organizationId,
    division,
  });

  if (certificationAttestations.length === 0) {
    throw new NoCertificateForDivisionError(division);
  }
  return certificationAttestations;
};

export { findCertificationAttestationsForDivision };
