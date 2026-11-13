import { UserNotAuthorizedToAccessEntityError } from '../../../../../shared/domain/errors.js';
import BadgeAcquisitionParticipationStatistic from '../../read-models/BadgeAcquisitionParticipationStatistic.js';

/**
 *
 * @param {number} userId
 * @param {number} campaignId
 *
 * @param campaignRepository
 * @param campaignParticipationsStatsRepository
 * @param badgeRepository
 * @param badgeAcquisitionRepository
 *
 * @returns {Promise<BadgeAcquisitionParticipationStatistic[]>}
 */
const getBadgeAcquisitionsStatistics = async function ({
  userId,
  campaignId,
  campaignRepository,
  campaignParticipationsStatsRepository,
  badgeRepository,
  badgeAcquisitionRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const badges = await badgeRepository.findByCampaignId(campaignId);

  if (!badges) {
    return [];
  }

  const participations = await campaignParticipationsStatsRepository.getAllParticipationsByCampaignId(campaignId);

  const badgesAcquisitions = await badgeAcquisitionRepository.getAcquiredBadgesForCampaignParticipations(
    participations.map(({ id }) => id),
  );

  const badgesAcquisitionsByBadgeId = Map.groupBy(badgesAcquisitions, (badgeAcquisition) => badgeAcquisition.badgeId);

  return badges.map((badge) => {
    const acquiredBadges = badgesAcquisitionsByBadgeId.get(badge.id) ?? [];

    return new BadgeAcquisitionParticipationStatistic({
      badge,
      count: acquiredBadges.length,
      totalParticipationCount: participations.length,
    });
  });
};

export { getBadgeAcquisitionsStatistics };
