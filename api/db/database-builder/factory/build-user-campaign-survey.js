import { databaseBuffer } from '../database-buffer.js';

export function buildUserCampaignSurvey({
  id = databaseBuffer.getNextId(),
  userId,
  campaignId,
  satisfactionScore = 3,
  createdAt = new Date(),
} = {}) {
  const surveyFormatted = JSON.stringify({ satisfactionScore });
  return databaseBuffer.pushInsertable({
    tableName: 'user-campaign-surveys',
    values: { id, userId, campaignId, survey: surveyFormatted, createdAt },
  });
}
