import { databaseBuffer } from '../database-buffer.ts';

export function buildLtiCampaignParticipation({
  id = databaseBuffer.getNextId(),
  clientId,
  platformUserSub = '1234',
  lineItemContainerUrl = 'https://moodle.example.net/mod/lti/services.php/2/lineitems?type_id=3',
  campaignId,
  createdAt = new Date('2024-01-01'),
  sentAt = null,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'lti_campaign_participations',
    values: {
      id,
      clientId,
      platformUserSub,
      lineItemContainerUrl,
      campaignId,
      createdAt,
      sentAt,
    },
  });
}
