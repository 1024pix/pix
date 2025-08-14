import * as injectedDivisionRepository from '../../../campaign/infrastructure/repositories/division-repository.js';
const findDivisionsByOrganization = async function ({
  organizationId,
  divisionRepository = injectedDivisionRepository,
} = {}) {
  const divisionsOrderedByPostgres = await divisionRepository.findByOrganizationIdForCurrentSchoolYear({
    organizationId,
  });
  const divisionsOrderedByName = divisionsOrderedByPostgres.sort((divisionA, divisionB) =>
    divisionA.name.localeCompare(divisionB.name, 'fr'),
  );
  return divisionsOrderedByName;
};

export { findDivisionsByOrganization };
