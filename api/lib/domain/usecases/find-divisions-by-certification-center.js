const findDivisionsByCertificationCenter = async function ({
  certificationCenterId,
  organizationRepository,
  divisionRepository,
}) {
  const organizationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);
  return divisionRepository.findByOrganizationIdForCurrentSchoolYear({ organizationId });
};

export { findDivisionsByCertificationCenter };
