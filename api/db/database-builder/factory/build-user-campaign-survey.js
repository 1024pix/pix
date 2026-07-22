import { databaseBuffer } from '../database-buffer.js';

export function buildUserCampaignSurvey({
  id = databaseBuffer.getNextId(),
  userId,
  campaignId,
  satisfactionScore = 3,
  usefulnessScore,
  personalizationScore,
  attractivenessScore,
  comment,

  createdAt = new Date(),
} = {}) {
  const surveyFormatted = JSON.stringify({
    attractivenessScore,
    comment,
    personalizationScore,
    satisfactionScore,
    usefulnessScore,
  });
  return databaseBuffer.pushInsertable({
    tableName: 'user-campaign-surveys',
    values: { id, userId, campaignId, survey: surveyFormatted, createdAt },
  });
}
