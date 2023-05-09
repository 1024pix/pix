import { databaseBuffer } from '../database-buffer.js';
import { buildCampaignParticipation } from './build-campaign-participation.js';

const buildBadgeAcquisition = function ({
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
};

export { buildBadgeAcquisition };
