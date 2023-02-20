export default async function findDivisionsByOrganization({ organizationId, divisionRepository }) {
  const divisionsOrderedByPostgres = await divisionRepository.findByOrganizationIdForCurrentSchoolYear({
    organizationId,
  });
  const divisionsOrderedByName = divisionsOrderedByPostgres.sort((divisionA, divisionB) =>
    divisionA.name.localeCompare(divisionB.name, 'fr')
  );
  return divisionsOrderedByName;
}
