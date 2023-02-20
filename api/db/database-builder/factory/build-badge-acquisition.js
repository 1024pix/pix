import databaseBuffer from '../database-buffer';
import buildCampaignParticipation from './build-campaign-participation';

export default function buildBadgeAcquisition({
  id = databaseBuffer.getNextId(),
  badgeId,
  userId,
  campaignParticipationId = buildCampaignParticipation().id,
  createdAt = new Date('2000-01-01'),
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'badge-acquisitions',
    values: {
      id,
      badgeId,
      userId,
      campaignParticipationId,
      createdAt,
    },
  });
}
