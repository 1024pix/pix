import { UserCampaignSurvey } from '../../../../src/devcomp/domain/models/UserCampaignSurvey.js';

export function buildUserCampaignSurvey({ userId = 1, campaignId = 1, satisfactionScore = 3 } = {}) {
  return new UserCampaignSurvey({ userId, campaignId, satisfactionScore });
}
