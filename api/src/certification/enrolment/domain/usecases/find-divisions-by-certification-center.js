import * as injectedDivisionRepository from '../../../../prescription/campaign/infrastructure/repositories/division-repository.js';
import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
const findDivisionsByCertificationCenter = async function ({
  certificationCenterId,
  organizationRepository = injectedOrganizationRepository,
  divisionRepository = injectedDivisionRepository,
} = {}) {
  const organizationId = await organizationRepository.getIdByCertificationCenterId(certificationCenterId);
  return divisionRepository.findByOrganizationIdForCurrentSchoolYear({ organizationId });
};

export { findDivisionsByCertificationCenter };
