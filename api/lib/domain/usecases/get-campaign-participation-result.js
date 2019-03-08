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

  const totalSkills = targetProfile.skills.length;
  const knowledgeElements = await smartPlacementKnowledgeElementRepository.findUniqByUserId(
    campaignParticipation.assessment.userId,
    campaignParticipation.sharedAt,
  );

  const testedKnowledgeElements = knowledgeElements.filter(
    (knowledgeElement) => targetProfile.skills.find((skill) => skill.id === knowledgeElement.skillId)
  );

  const testedSkills = testedKnowledgeElements.length;

  const validatedSkills = campaignParticipation.isShared ? testedKnowledgeElements.filter(
    (ke) => ke.isValidated
  ).length : null;

  return new CampaignParticipationResult({
    id: campaignParticipationId,
    totalSkills,
    testedSkills,
    validatedSkills,
    isCompleted,
  });
};
