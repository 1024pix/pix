const { NoCertificationAttestationForDivisionError } = require('../../errors');

module.exports = async function findCertificationAttestationsForDivision({
  organizationId,
  division,
  certificationAttestationRepository,
}) {
  const certificationAttestations =
    await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization({
      organizationId,
      division,
    });

  if (certificationAttestations.length === 0) {
    throw new NoCertificationAttestationForDivisionError(division);
  }
  return certificationAttestations;
};
