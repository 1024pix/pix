import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import * as checkCampaignParticipationBelongsToUserUsecase from '../../campaign-participation/application/usecases/checkCampaignParticipationBelongsToUser.js';
import * as checkAuthorizationToAccessCampaignUsecase from './usecases/checkAuthorizationToAccessCampaign.js';
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

async function checkAuthorizationToAccessCampaign(
  request,
  h,
  dependencies = { checkAuthorizationToAccessCampaignUsecase },
) {
  const userId = request.auth.credentials.userId;
  const campaignId = request.params.campaignId || request.params.id;
  const belongsToOrganization = await dependencies.checkAuthorizationToAccessCampaignUsecase.execute({
    userId,
    campaignId,
  });

  if (belongsToOrganization) return h.response(true);
  return securityPreHandlers.replyForbiddenError(h);
}

// bounded-context: this is not tested
async function checkCampaignParticipationBelongsToUser(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return securityPreHandlers.replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;
  const { campaignParticipationId } = request.params;
  await checkCampaignParticipationBelongsToUserUsecase.execute({ userId, campaignParticipationId });
  return h.response(true);
}

export const campaignSecurityPreHandlers = {
  checkCampaignBelongsToCombinedCourse,
  checkAuthorizationToManageCampaign,
  checkAuthorizationToAccessCampaign,
  checkCampaignParticipationBelongsToUser,
};
