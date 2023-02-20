import CampaignParticipationResult from '../../../../lib/domain/models/CampaignParticipationResult';

export default function buildCampaignParticipationResult({
  id = 1,
  isCompleted = true,
  totalSkillsCount = 10,
  testedSkillsCount = 8,
  validatedSkillsCount = 5,
  competenceResults = [],
  reachedStage = {},
  stageCount = 5,
} = {}) {
  return new CampaignParticipationResult({
    id,
    isCompleted,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    competenceResults,
    reachedStage,
    stageCount,
  });
}
