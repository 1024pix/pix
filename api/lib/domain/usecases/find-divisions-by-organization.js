
module.exports = async function findDivisionsByOrganization({
  organizationId,
  divisionRepository,
}) {
  const divisionsOrderedByPostgres = await divisionRepository.findByOrganizationId({ organizationId });
  const divisionsOrderedByName = divisionsOrderedByPostgres.sort((divisionA, divisionB) =>
    divisionA.name.localeCompare(divisionB.name, 'fr'),
  );
  return divisionsOrderedByName;
};
