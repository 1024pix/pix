import { databaseBuffer } from '../database-buffer.js';

export function buildUserCampaignSurvey({
  id = databaseBuffer.getNextId(),
  userId,
  campaignId,
  satisfactionScore = 3,
  createdAt = new Date(),
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'user-campaign-surveys',
    values: { id, userId, campaignId, satisfactionScore, createdAt },
  });
}
