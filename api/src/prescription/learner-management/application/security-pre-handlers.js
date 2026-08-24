import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import * as checkOrganizationLearnerBelongsToOrganizationUseCase from './usecases/checkOrganizationLearnerBelongsToOrganization.js';

async function checkOrganizationLearnerBelongsToOrganization(
  request,
  h,
  dependencies = { checkOrganizationLearnerBelongsToOrganizationUseCase },
) {
  const organizationId = request.params.organizationId;
  const organizationLearnerId = request.params.organizationLearnerId;

  try {
    const organizationLearnerBelongsToOrganization =
      await dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute(
        organizationId,
        organizationLearnerId,
      );
    return organizationLearnerBelongsToOrganization ? h.response(true) : securityPreHandlers.replyNotFoundError(h);
  } catch {
    return securityPreHandlers.replyForbiddenError(h);
  }
}

export const learnerManagementSecurityPreHandlers = {
  checkOrganizationLearnerBelongsToOrganization,
};
