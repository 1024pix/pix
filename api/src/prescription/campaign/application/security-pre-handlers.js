import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import * as checkAuthorizationToManageCampaignUsecase from './usecases/checkAuthorizationToManageCampaign.js';
import * as checkCampaignBelongsToCombinedCourseUsecase from './usecases/checkCampaignBelongsToCombinedCourse.js';

async function checkCampaignBelongsToCombinedCourse(
  request,
  h,
  dependencies = { checkCampaignBelongsToCombinedCourseUsecase },
) {
  const campaignId = parseInt(request.params.campaignId);

  await dependencies.checkCampaignBelongsToCombinedCourseUsecase.execute({ campaignId });
  return h.response(true);
}

async function checkAuthorizationToManageCampaign(
  request,
  h,
  dependencies = { checkAuthorizationToManageCampaignUsecase },
) {
  const userId = request.auth.credentials.userId;
  const campaignId = request.params.campaignId || request.params.id;
  const isAdminOrOwnerOfTheCampaign = await dependencies.checkAuthorizationToManageCampaignUsecase.execute({
    userId,
    campaignId,
  });

  if (isAdminOrOwnerOfTheCampaign) return h.response(true);
  return securityPreHandlers.replyForbiddenError(h);
}

export const campaignSecurityPreHandlers = {
  checkCampaignBelongsToCombinedCourse,
  checkAuthorizationToManageCampaign,
};
