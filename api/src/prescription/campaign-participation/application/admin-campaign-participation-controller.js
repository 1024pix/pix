import { usecases } from '../domain/usecases/index.js';
import * as campaignParticipationForUserManagementSerializer from '../infrastructure/serializers/jsonapi/campaign-participation-for-user-management-serializer.js';

const findCampaignParticipationsForUserManagement = async function (
  request,
  h,
  dependencies = { campaignParticipationForUserManagementSerializer },
) {
  const userId = request.params.userId;
  const campaignParticipations = await usecases.findCampaignParticipationsForUserManagement({
    userId,
  });
  return dependencies.campaignParticipationForUserManagementSerializer.serialize(campaignParticipations);
};

const adminCampaignParticipationController = {
  findCampaignParticipationsForUserManagement,
};

export { adminCampaignParticipationController };
