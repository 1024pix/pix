const _ = require('lodash');
const CampaignParticipationResult = require('../../domain/models/CampaignParticipationResult');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getCampaignParticipationResult(
  {
    userId,
    campaignParticipationId,
    assessmentRepository,
    badgeRepository,
    campaignParticipationRepository,
    campaignRepository,
    competenceRepository,
    knowledgeElementRepository,
    targetProfileRepository,
    badgeCriteriaService,
  }
) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  await _checkIfUserHasAccessToThisCampaignParticipation(userId, campaignParticipation, campaignRepository);

  const [ targetProfile, competences, assessment, knowledgeElements ] = await Promise.all([
    targetProfileRepository.getByCampaignId(campaignParticipation.campaignId),
    competenceRepository.list(),
    assessmentRepository.get(campaignParticipation.assessmentId),
    knowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId, limitDate: campaignParticipation.sharedAt }),
  ]);

  const badge = await badgeRepository.findOneByTargetProfileId(targetProfile.id);

  const campaignParticipationResult = CampaignParticipationResult.buildFrom({
    campaignParticipationId,
    assessment,
    competences,
    targetProfile,
    knowledgeElements,
    badge
  });

  if (_hasBadgeInformation(badge)) {
    campaignParticipationResult.areBadgeCriteriaFulfilled = badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });
  }

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

function _hasBadgeInformation(badge) {
  return !_.isEmpty(badge);
}
