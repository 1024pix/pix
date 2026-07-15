import { UserCampaignSurvey } from '../models/UserCampaignSurvey.js';

export async function saveUserCampaignSurvey({
  userId,
  campaignId,
  satisfactionScore,
  usefulnessScore,
  personalizationScore,
  attractivenessScore,
  comment,
  userCampaignSurveyRepository,
}) {
  const survey = new UserCampaignSurvey({
    userId,
    campaignId,
    satisfactionScore,
    usefulnessScore,
    personalizationScore,
    attractivenessScore,
    comment,
  });
  return userCampaignSurveyRepository.save(survey);
}
