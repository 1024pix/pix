const { NoCertificationAttestationForDivisionError } = require('../../errors.js');

module.exports = async function findCertificationAttestationsForDivision({
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
};
