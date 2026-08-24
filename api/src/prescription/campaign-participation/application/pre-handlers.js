import boom from '@hapi/boom';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { usecases } from '../domain/usecases/index.js';
import * as checkCampaignParticipationBelongsToUserUsecase from './usecases/checkCampaignParticipationBelongsToUser.js';

// as organization's member, can he see the participation of this learner
async function checkUserCanAccessCampaignParticipation(
  request,
  h,
  dependencies = { checkUserCanAccessCampaignParticipation: usecases.checkUserHasAccessToCampaignParticipation },
) {
  const userId = request.auth?.credentials?.userId;
  const campaignParticipationId = request.params?.campaignParticipationId;

  if (!userId || !campaignParticipationId) return boom.forbidden();

  const hasAccess = await dependencies.checkUserCanAccessCampaignParticipation({ userId, campaignParticipationId });

  if (!hasAccess) return boom.forbidden();

  return h.continue;
}

// as user, is it your participation ?
async function checkCampaignParticipationBelongsToUser(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return securityPreHandlers.replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;
  const { campaignParticipationId } = request.params;
  await checkCampaignParticipationBelongsToUserUsecase.execute({ userId, campaignParticipationId });
  return h.response(true);
}

const campaignParticipationPreHandlers = {
  checkCampaignParticipationBelongsToUser,
  checkUserCanAccessCampaignParticipation,
};

export { campaignParticipationPreHandlers };
