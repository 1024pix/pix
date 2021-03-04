
module.exports = async function findDivisionsByCertificationCenter({
  certificationCenterId,
  organizationRepository,
  divisionRepository,
}) {
  const organizationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);
  return divisionRepository.findByOrganizationId({ organizationId });
};

