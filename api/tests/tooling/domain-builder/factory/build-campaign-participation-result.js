import { CampaignParticipationResult } from '../../../../lib/domain/models/CampaignParticipationResult.js';

const buildCampaignParticipationResult = function ({
  id = 1,
  isCompleted = true,
  totalSkillsCount = 10,
  testedSkillsCount = 8,
  validatedSkillsCount = 5,
  competenceResults = [],
} = {}) {
  return new CampaignParticipationResult({
    id,
    isCompleted,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    competenceResults,
  });
};

export { buildCampaignParticipationResult };
