const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Badge = require('../models/Badge');

module.exports = async function getCampaignParticipationResult(
  {
    userId,
    campaignParticipationId,
    badgeRepository,
    badgeAcquisitionRepository,
    campaignParticipationRepository,
    campaignParticipationResultRepository,
    campaignRepository,
    targetProfileRepository,
  }
) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  await _checkIfUserHasAccessToThisCampaignParticipation(userId, campaignParticipation, campaignRepository);

  const targetProfile = await targetProfileRepository.getByCampaignId(campaignParticipation.campaignId);
  const campaignBadges = await badgeRepository.findByTargetProfileId(targetProfile.id);
  const campaignBadgeIds = campaignBadges.map((badge) => badge.id);
  const emploiCleaBadge = _.find(campaignBadges, (badge) => !_.isEmpty(badge.badgePartnerCompetences) && badge.key === Badge.keys.PIX_EMPLOI_CLEA);

  const acquiredBadgeIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({ userId, badgeIds: campaignBadgeIds });
  const acquiredBadges = campaignBadges.filter((badge) => _.includes(acquiredBadgeIds, badge.id));

  const campaignParticipationResult = await campaignParticipationResultRepository.getByParticipationId(campaignParticipationId, campaignBadges, acquiredBadges);
  campaignParticipationResult.filterPartnerCompetenceResultsWithBadge(emploiCleaBadge);

  return campaignParticipationResult;
};

async function _checkIfUserHasAccessToThisCampaignParticipation(userId, campaignParticipation, campaignRepository) {
  const campaignParticipationBelongsToUser = (userId === campaignParticipation.userId);
  const userIsMemberOfCampaignOrganization = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(
    campaignParticipation.campaignId,
    userId
  );

  if (!campaignParticipationBelongsToUser && !userIsMemberOfCampaignOrganization) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign participation');
  }
}
