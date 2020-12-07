
module.exports = async function findOrganizationDivisionList({
  certificationCenterId,
  organizationRepository,
  schoolingRegistrationRepository,
}) {
  const organizationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);
  const divisionList = await schoolingRegistrationRepository.findDivisionsByOrganizationId({ organizationId });

  return divisionList.data.length > 0 ? divisionList : [];
};

