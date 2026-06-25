export const verifyExistingUserCampaignSurvey = async function ({ campaignId, userId, userCampaignSurveyRepository }) {
  const userCampaignSurvey = await userCampaignSurveyRepository.findByCampaignIdAndUserId({ campaignId, userId });

  return Boolean(userCampaignSurvey);
};
