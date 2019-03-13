const CampaignParticipationResult = require('../models/CampaignParticipationResult');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getCampaignParticipationResult(
  {
    campaignParticipationId,
    campaignParticipationRepository,
    targetProfileRepository,
    smartPlacementKnowledgeElementRepository,
    campaignRepository,
    userId
  }
) {
  const campaignParticipation = await campaignParticipationRepository.get(
    campaignParticipationId,
    { include: ['assessment', 'campaign'] },
  );

  const userIsCampaignOrganizationMember = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(
    campaignParticipation.campaignId,
    userId
  );

  if(userId === campaignParticipation.userId || userIsCampaignOrganizationMember) {
    return await _createCampaignParticipationResult({
      campaignParticipationId,
      targetProfileRepository,
      smartPlacementKnowledgeElementRepository,
      campaignParticipation
    });
  }

  throw new UserNotAuthorizedToAccessEntity('User does not have access to campaign participation results');
};

async function _createCampaignParticipationResult(
  {
    campaignParticipationId,
    targetProfileRepository,
    smartPlacementKnowledgeElementRepository,
    campaignParticipation
  }
) {
  const isCompleted = campaignParticipation.assessment.isCompleted();

  const targetProfile = await targetProfileRepository.get(campaignParticipation.campaign.targetProfileId);

  const totalSkillsCount = targetProfile.skills.length;

  const knowledgeElements = await smartPlacementKnowledgeElementRepository.findUniqByUserId(
    campaignParticipation.assessment.userId,
    campaignParticipation.sharedAt,
  );

  const testedKnowledgeElements = knowledgeElements.filter(
    (knowledgeElement) => targetProfile.skills.find((skill) => skill.id === knowledgeElement.skillId)
  );

  const testedSkillsCount = testedKnowledgeElements.length;

  const validatedSkillsCount = campaignParticipation.isShared ? testedKnowledgeElements.filter(
    (ke) => ke.isValidated
  ).length : null;

  return new CampaignParticipationResult({
    id: campaignParticipationId,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    isCompleted,
  });
}
