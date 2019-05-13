const CampaignCompetenceCollectiveResult = require('../../../../lib/domain/models/CampaignCompetenceCollectiveResult');

module.exports = function buildCampaignCompetenceCollectiveResult(
  {
    campaignId,
    competenceId,
    competenceName,
    competenceIndex,
    totalSkillsCount,
    averageValidatedSkills,
  } = {}) {
  return new CampaignCompetenceCollectiveResult({
    campaignId,
    competenceId,
    competenceName,
    competenceIndex,
    totalSkillsCount,
    averageValidatedSkills,
  });
};
