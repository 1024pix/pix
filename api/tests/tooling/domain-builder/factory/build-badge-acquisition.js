import { buildBadge } from './build-badge.js';
import { BadgeAcquisition } from '../../../../lib/domain/models/BadgeAcquisition.js';

const buildBadgeAcquisition = function buildBadgeAcquisition({
  id = 123,
  userId = 456,
  badgeId = 789,
  campaignParticipationId = 159,
  badge,
} = {}) {
  badge = badge || buildBadge({ id: badgeId });
  return new BadgeAcquisition({
    id,
    userId,
    badgeId,
    campaignParticipationId,
    badge,
  });
};

export { buildBadgeAcquisition };
