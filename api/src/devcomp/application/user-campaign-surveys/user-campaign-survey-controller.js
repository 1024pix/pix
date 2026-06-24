import { usecases } from '../../domain/usecases/index.js';

async function saveUserCampaignSurvey(request, h) {
  const { userId } = request.auth.credentials;
  const { 'campaign-id': campaignId, 'satisfaction-score': satisfactionScore } = request.payload.data.attributes;

  const id = await usecases.saveUserCampaignSurvey({ userId, campaignId, satisfactionScore });

  return h.response({ data: { id: String(id), type: 'user-campaign-surveys' } }).created();
}

export const userCampaignSurveyController = { saveUserCampaignSurvey };
