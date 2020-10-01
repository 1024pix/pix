const CampaignCompetenceCollectiveResult = require('../../../../lib/domain/models/CampaignCompetenceCollectiveResult');
const buildTargetedCompetence = require('./build-targeted-competence');
const buildTargetedArea = require('./build-targeted-area');

module.exports = function buildCampaignCompetenceCollectiveResult(
  {
    campaignId,
    targetedCompetence = buildTargetedCompetence(),
    targetedArea = buildTargetedArea(),
    averageValidatedSkills,
  } = {}) {
  return new CampaignCompetenceCollectiveResult({
    campaignId,
    targetedCompetence,
    targetedArea,
    averageValidatedSkills,
  });
};
