import { NoCertificateForDivisionError } from '../../../../shared/domain/errors.js';
import * as injectedCertificateRepository from '../../infrastructure/repositories/certificate-repository.js';

const findCertificatesForDivision = async function ({
  organizationId,
  division,
  locale,
  certificateRepository = injectedCertificateRepository,
} = {}) {
  const certificates = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
    organizationId,
    division,
    locale,
  });

  if (certificates.length === 0) {
    throw new NoCertificateForDivisionError(division);
  }
  return certificates;
};

export { findCertificatesForDivision };
