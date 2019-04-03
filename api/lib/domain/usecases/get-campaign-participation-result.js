const CampaignParticipationResult = require('../models/CampaignParticipationResult');
const CompetenceResult = require('../models/CompetenceResult');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const _ = require('lodash');

module.exports = async function getCampaignParticipationResult(
  {
    userId,
    campaignParticipationId,
    campaignParticipationRepository,
    targetProfileRepository,
    smartPlacementKnowledgeElementRepository,
    campaignRepository,
    competenceRepository,
  }
) {
  const campaignParticipation = await campaignParticipationRepository.get(
    campaignParticipationId,
    { include: ['assessment', 'campaign'] },
  );

  const userIsNotRequestingHisCampaignParticipation = !(userId === campaignParticipation.userId);
  const userIsNotCampaignOrganizationMember = !(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(
    campaignParticipation.campaignId,
    userId
  ));

  if(userIsNotRequestingHisCampaignParticipation && userIsNotCampaignOrganizationMember ) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign participation');
  }

  return await _createCampaignParticipationResult({
    userId,
    campaignParticipationId,
    targetProfileRepository,
    smartPlacementKnowledgeElementRepository,
    campaignParticipation,
    competenceRepository,
  });

};

async function _createCampaignParticipationResult(
  {
    userId,
    campaignParticipationId,
    targetProfileRepository,
    smartPlacementKnowledgeElementRepository,
    campaignParticipation,
    competenceRepository
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

  const showValidatedSkills = campaignParticipation.userId === userId || campaignParticipation.isShared;

  const validatedSkillsCount = showValidatedSkills
    ? testedKnowledgeElements.filter((ke) => ke.isValidated).length
    : null;

  const competences = await competenceRepository.list();

  const targetSkillIds = targetProfile.skills.map((skill) => skill.id);

  const targetedCompetenceResults = competences.reduce(function(competenceResults, competence) {
    const competenceTotalSkillIds = _.intersection(competence.skills, targetSkillIds);

    if (competenceTotalSkillIds.length) {
      const competenceTestedKnowledgeElements = testedKnowledgeElements.filter(
        (ke) => competenceTotalSkillIds.includes(ke.skillId)
      );

      const competenceValidatedKnowledgeElementsCount = showValidatedSkills
        ? competenceTestedKnowledgeElements.filter((ke) => ke.isValidated).length
        : null;

      const competenceResult = new CompetenceResult({
        id: competence.id,
        name: competence.name,
        index: competence.index,
        totalSkillsCount: competenceTotalSkillIds.length,
        testedSkillsCount: competenceTestedKnowledgeElements.length,
        validatedSkillsCount: competenceValidatedKnowledgeElementsCount,
      });

      competenceResults.push(competenceResult);
    }

    return competenceResults;
  }, []);

  return new CampaignParticipationResult({
    id: campaignParticipationId,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    isCompleted,
    competenceResults: targetedCompetenceResults,
  });
}
