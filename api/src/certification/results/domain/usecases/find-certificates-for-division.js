import { NoCertificateForDivisionError } from '../../../../shared/domain/errors.js';

export async function findCertificatesForDivision({ organizationId, division, locale, certificateRepository }) {
  const certificates = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
    organizationId,
    division,
    locale,
  });

  if (certificates.length === 0) {
    throw new NoCertificateForDivisionError(division);
  }
  return certificates;
}
