const findDivisionsByOrganization = async function ({ organizationId, divisionRepository }) {
  const divisionsOrderedByPostgres = await divisionRepository.findByOrganizationIdForCurrentSchoolYear({
    organizationId,
  });
  const divisionsOrderedByName = divisionsOrderedByPostgres.sort((divisionA, divisionB) =>
    divisionA.name.localeCompare(divisionB.name, 'fr')
  );
  return divisionsOrderedByName;
};

export { findDivisionsByOrganization };
