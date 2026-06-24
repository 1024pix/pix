import { UserCampaignSurvey } from '../models/UserCampaignSurvey.js';

export async function saveUserCampaignSurvey({ userId, campaignId, satisfactionScore, userCampaignSurveyRepository }) {
  const survey = new UserCampaignSurvey({ userId, campaignId, satisfactionScore });
  return userCampaignSurveyRepository.save(survey);
}
