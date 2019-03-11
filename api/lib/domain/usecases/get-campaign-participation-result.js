const CampaignParticipationResult = require('../models/CampaignParticipationResult');

module.exports = async function getCampaignParticipationResult({
  campaignParticipationId,
  campaignParticipationRepository,
  targetProfileRepository,
  smartPlacementKnowledgeElementRepository
}) {
  const campaignParticipation = await campaignParticipationRepository.get(
    campaignParticipationId,
    { include: ['assessment', 'campaign'] },
  );

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
};
