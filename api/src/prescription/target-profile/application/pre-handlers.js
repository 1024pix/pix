import boom from '@hapi/boom';

import { usecases } from '../domain/usecases/index.js';

async function checkTargetProfileBelongsToOrganization(
  request,
  h,
  dependencies = { checkTargetProfileBelongsToOrganizationUsecase: usecases.checkTargetProfileBelongsToOrganization },
) {
  const targetProfileId = parseInt(request.params.targetProfileId);
  const organizationId = parseInt(request.params.organizationId);

  const belongsToOrganization = await dependencies.checkTargetProfileBelongsToOrganizationUsecase({
    targetProfileId,
    organizationId,
  });

  return belongsToOrganization ? h.continue : boom.forbidden();
}

export const targetProfilePreHandlers = { checkTargetProfileBelongsToOrganization };
