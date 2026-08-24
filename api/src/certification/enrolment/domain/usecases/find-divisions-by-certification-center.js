import { NotFoundError } from '../../../../shared/domain/errors.js';

export async function findDivisionsByCertificationCenter({
  certificationCenterId,
  centerRepository,
  divisionRepository,
}) {
  const activeOrganizationId = await centerRepository.findActiveScoOrganizationId({
    certificationCenterId,
  });

  if (!activeOrganizationId) {
    throw new NotFoundError('No organization found for this certification center');
  }

  return divisionRepository.findActiveDivisionsByOrganizationId({ organizationId: activeOrganizationId });
}
