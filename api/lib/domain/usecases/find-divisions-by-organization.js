
module.exports = function findDivisionsByOrganization({
  organizationId,
  schoolingRegistrationRepository,
}) {
  return schoolingRegistrationRepository.findDivisionsByOrganizationId({ organizationId });
};

