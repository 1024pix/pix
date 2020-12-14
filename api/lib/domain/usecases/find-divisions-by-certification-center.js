
module.exports = async function findDivisionsByCertificationCenter({
  certificationCenterId,
  organizationRepository,
  schoolingRegistrationRepository,
}) {
  const organizationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);
  return schoolingRegistrationRepository.findDivisionsByOrganizationId({ organizationId });
};

