import { usecases } from '../../domain/usecases/index.js';

async function saveUserCampaignSurvey(request, h) {
  const { userId } = request.auth.credentials;
  const {
    'campaign-id': campaignId,
    'satisfaction-score': satisfactionScore,
    'usefulness-score': usefulnessScore,
    'personalization-score': personalizationScore,
    'attractiveness-score': attractivenessScore,
    comment,
  } = request.payload.data.attributes;

  const id = await usecases.saveUserCampaignSurvey({
    userId,
    campaignId,
    satisfactionScore,
    usefulnessScore,
    personalizationScore,
    attractivenessScore,
    comment,
  });

  return h.response({ data: { id: String(id), type: 'user-campaign-surveys' } });
}

async function verifyExistingUserCampaignSurvey(request, h) {
  const { userId } = request.auth.credentials;
  const { campaignId } = request.params;
  const isAlreadyAnsweredSurvey = await usecases.verifyExistingUserCampaignSurvey({ userId, campaignId });
  return h.response({ hasAnswered: isAlreadyAnsweredSurvey });
}

export const userCampaignSurveyController = { saveUserCampaignSurvey, verifyExistingUserCampaignSurvey };
