const CampaignParticipationResult = require('../../domain/models/CampaignParticipationResult');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getCampaignParticipationResult(
  {
    userId,
    campaignParticipationId,
    campaignParticipationRepository,
    campaignRepository,
    competenceRepository,
    assessmentRepository,
    targetProfileRepository,
    knowledgeElementRepository,
    improvmentService,
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
  const couldBeImprove = improvmentService.verifyIfAssessmentCouldBeImproved({ assessment, knowledgeElements, listOfSkillsTested: targetProfile.skills });
  return CampaignParticipationResult.buildFrom({ campaignParticipationId, assessment, competences, targetProfile, knowledgeElements, couldBeImprove });
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
