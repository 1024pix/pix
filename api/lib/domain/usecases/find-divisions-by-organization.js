
module.exports = function findDivisionsByOrganization({
  organizationId,
  divisionRepository,
}) {
  return divisionRepository.findByOrganizationId({ organizationId });
};

