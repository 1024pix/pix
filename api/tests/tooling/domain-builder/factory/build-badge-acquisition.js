import { BadgeAcquisition } from '../../../../src/shared/domain/models/BadgeAcquisition.js';
import { buildBadge } from './build-badge.js';

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
