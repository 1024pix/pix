import * as centerRepository from '../../../certification/enrolment/infrastructure/repositories/center-repository.js';
import * as organizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';

const execute = async function ({
  certificationCenterId,
  dependencies = { centerRepository, organizationRepository },
}) {
  const organizationId = await dependencies.centerRepository.findActiveScoOrganizationId({ certificationCenterId });
  if (!organizationId) {
    return false;
  }

  const organization = await dependencies.organizationRepository.get(organizationId);
  return organization.isScoAndManagingStudents;
};

export { execute };
